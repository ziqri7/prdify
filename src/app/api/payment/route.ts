import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { PRICING, getDbPackageType, type PackageId } from "@/lib/constants";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/server-auth";

/** Gateway configuration — enable whichever gateway(s) you use */
const GATEWAYS = {
  midtrans: !!process.env.MIDTRANS_SERVER_KEY,
  sumopod: !!process.env.SUMOPOD_API_KEY && !!process.env.SUMOPOD_WEBHOOK_SECRET,
  doku: false,
  ipaymu: false,
} as const;

function isGatewayAvailable(name: keyof typeof GATEWAYS): boolean {
  return GATEWAYS[name];
}

function getActiveGateways(): string[] {
  return (Object.keys(GATEWAYS) as (keyof typeof GATEWAYS)[]).filter((k) => GATEWAYS[k]);
}

// ---------------------------------------------------------------------------
// MIDTRANS
// ---------------------------------------------------------------------------
async function createMidtransInvoice(pkg: string, amount: number, paymentMethod: string, prdId: string | null, externalId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";
  const successUrl = prdId
    ? `${appUrl}/preview/${prdId}?payment=success`
    : `${appUrl}/dashboard?payment=pending`;

  const payload: Record<string, unknown> = {
    transaction_details: {
      order_id: externalId,
      gross_amount: amount,
    },
    credit_card: { secure: true },
    customer_details: {},
    enabled_payments: getMidtransPaymentMethods(paymentMethod),
    callbacks: {
      finish: successUrl,
      error: `${appUrl}/payment?status=failed`,
      pending: `${appUrl}/payment?status=pending`,
    },
    expiry: {
      duration: 24,
      unit: "hours",
    },
  };

  const auth = Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64");
  const isProduction = process.env.MIDTRANS_SERVER_KEY?.startsWith("Mid-server");
  const baseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Midtrans error");

  return {
    id: data.token,
    external_id: externalId,
    amount,
    status: "PENDING",
    payment_method: paymentMethod,
    invoice_url: data.redirect_url,
    gateway: "midtrans",
  };
}

function getMidtransPaymentMethods(method: string): string[] {
  const map: Record<string, string[]> = {
    bca: ["bca_klikbca", "bca_klikpay"],
    mandiri: ["mandiri_clickpay", "echannel"],
    bri: ["bri_epay"],
    bni: ["bni_va"],
    gopay: ["gopay"],
    ovo: ["ovo"],
    dana: ["gopay"], // dana via gopay on midtrans
    qris: ["gopay", "shopeepay", "other_qris"],
    shopeepay: ["shopeepay"],
    akulaku: ["akulaku"],
  };
  return map[method] || ["gopay", "bca_klikbca", "bni_va", "mandiri_clickpay"];
}

// ---------------------------------------------------------------------------
// SUMOPOD PAY
// ---------------------------------------------------------------------------
async function createSumopodInvoice(pkg: string, amount: number, paymentMethod: string, prdId: string | null, externalId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";
  const successUrl = prdId
    ? `${appUrl}/preview/${prdId}?payment=success`
    : `${appUrl}/dashboard?payment=pending`;

  const payload = {
    order_id: externalId,
    amount,
    currency: "IDR",
    expires_in_hours: 24,
    success_return_url: successUrl,
    cancel_return_url: `${appUrl}/payment?status=failed`,
    payment_method_type_code: getSumopodPaymentMethod(paymentMethod),
  };

  const baseUrl =
    process.env.SUMOPOD_BASE_URL || "https://api-pay-sandbox.sumopod.com/api/v1";

  const response = await fetch(`${baseUrl}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": process.env.SUMOPOD_API_KEY!,
    },
    body: JSON.stringify(payload),
  });

  const rawResponse = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(rawResponse) as Record<string, unknown>;
  } catch {
    // Use the HTTP status below if SumoPod returns a non-JSON error page.
  }

  if (!response.ok) {
    // Only surface the provider's designated human-readable fields. Never
    // include request headers or an opaque response body in logs/errors.
    const providerMessage =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : `HTTP ${response.status}`;
    const validationFields =
      data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)
        ? Object.keys(data.errors as Record<string, unknown>).slice(0, 8)
        : [];
    const validationHint = validationFields.length > 0
      ? ` (fields: ${validationFields.join(", ")})`
      : "";
    throw new Error(`SumoPod ${providerMessage}${validationHint}`);
  }

  // SumoPod returns `payment_id` (not a generic `id`) and a lowercase
  // lifecycle status. Preserve the provider ID for diagnostics while keeping
  // the API contract aligned with the application's uppercase statuses.
  const paymentId = typeof data.payment_id === "string" ? data.payment_id : externalId;
  const paymentStatus = typeof data.status === "string"
    ? data.status.toUpperCase()
    : "PENDING";

  return {
    id: paymentId,
    external_id: externalId,
    amount,
    status: paymentStatus,
    payment_method: paymentMethod,
    invoice_url:
      typeof data.payment_link_url === "string"
        ? data.payment_link_url
        : typeof data.url === "string"
          ? data.url
          : undefined,
    gateway: "sumopod",
  };
}

function getSumopodPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    qris: "QRIS",
  };
  return map[method] || "QRIS";
}

// ---------------------------------------------------------------------------
// DOKU
// ---------------------------------------------------------------------------
async function createDokuInvoice(pkg: string, amount: number, paymentMethod: string, prdId: string | null, externalId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";
  const successUrl = prdId
    ? `${appUrl}/preview/${prdId}?payment=success`
    : `${appUrl}/dashboard?payment=pending`;

  const timestamp = new Date().toISOString().replace(/[:-]/g, "").split(".")[0] + "000";
  const signature = Buffer.from(
    process.env.DOKU_CLIENT_ID + ":" + process.env.DOKU_SECRET_KEY + ":" + timestamp
  ).toString("base64");

  const payload = {
    client: { id: process.env.DOKU_CLIENT_ID },
    order: {
      invoice_number: externalId,
      amount,
      currency: "IDR",
      callback_url: `${appUrl}/api/payment/webhook/doku`,
      auto_redirect: true,
      url_failed: `${appUrl}/payment?status=failed`,
      url_success: successUrl,
      notify_url: `${appUrl}/api/payment/webhook/doku`,
    },
    payment: {
      payment_due_date: 24,
      payment_method_types: getDokuPaymentMethods(paymentMethod),
    },
    customer: {},
    billing_address: {},
    line_items: [
      {
        name: `BuatPakeAI - ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"} PRD`,
        quantity: 1,
        price: amount,
      },
    ],
  };

  const response = await fetch(
    process.env.DOKU_IS_PRODUCTION === "true"
      ? "https://api.doku.com/checkout/v1/payment"
      : "https://api-sandbox.doku.com/checkout/v1/payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Signature: signature,
        "Request-Timestamp": timestamp,
        "Client-Id": process.env.DOKU_CLIENT_ID!,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "DOKU error");

  return {
    id: data.order?.invoice_number || externalId,
    external_id: externalId,
    amount,
    status: "PENDING",
    payment_method: paymentMethod,
    invoice_url: data.payment?.url || data.order?.url,
    gateway: "doku",
  };
}

function getDokuPaymentMethods(method: string): string[] {
  const map: Record<string, string[]> = {
    bca: ["VIRTUAL_ACCOUNT_BCA"],
    mandiri: ["VIRTUAL_ACCOUNT_MANDIRI"],
    bri: ["VIRTUAL_ACCOUNT_BRI"],
    bni: ["VIRTUAL_ACCOUNT_BNI"],
    gopay: ["GOPAY"],
    ovo: ["OVO"],
    dana: ["DANA"],
    qris: ["QRIS"],
    shopeepay: ["SHOPEEPAY"],
    credit_card: ["CREDIT_CARD"],
  };
  return map[method] || ["VIRTUAL_ACCOUNT_BCA", "GOPAY", "QRIS"];
}

// ---------------------------------------------------------------------------
// IPAYMU
// ---------------------------------------------------------------------------
async function createIpaymuInvoice(pkg: string, amount: number, paymentMethod: string, prdId: string | null, externalId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";
  const successUrl = prdId
    ? `${appUrl}/preview/${prdId}?payment=success`
    : `${appUrl}/dashboard?payment=pending`;

  const body = new URLSearchParams();
  body.append("product", `BuatPakeAI ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"}`);
  body.append("qty", "1");
  body.append("price", amount.toString());
  body.append("description", `PRD - ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"} Package`);
  body.append("returnUrl", successUrl);
  body.append("cancelUrl", `${appUrl}/payment?status=failed`);
  body.append("notifyUrl", `${appUrl}/api/payment/webhook/ipaymu`);
  body.append("referenceId", externalId);
  body.append("paymentMethod", getIpaymuPaymentMethod(paymentMethod));

  const hash = createHash("sha256")
    .update(
      `BUATPAKEAI:${amount}:${process.env.IPAYMU_API_KEY}:${process.env.IPAYMU_PRIVATE_KEY}`
    )
    .digest("hex");

  const isProduction = process.env.IPAYMU_MODE === "production";
  const baseUrl = isProduction ? "https://api.ipaymu.com" : "https://sandbox.ipaymu.com";

  const response = await fetch(`${baseUrl}/api/v2/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      signature: hash,
      va: process.env.IPAYMU_VA || "BUATPAKEAI",
      timestamp: Math.floor(Date.now() / 1000).toString(),
      key: process.env.IPAYMU_API_KEY!,
    },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok || data.Status !== 200) throw new Error(data.Message || "Ipaymu error");

  return {
    id: data.Data?.SessionID || externalId,
    external_id: externalId,
    amount,
    status: "PENDING",
    payment_method: paymentMethod,
    invoice_url: data.Data?.Url,
    gateway: "ipaymu",
  };
}

function getIpaymuPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    bca: "bca",
    mandiri: "mandiri",
    bri: "bri",
    bni: "bni",
    gopay: "gopay",
    ovo: "ovo",
    dana: "dana",
    qris: "qris",
    shopeepay: "shopeepay",
    akulaku: "akulaku",
    credit_card: "creditcard",
    indomaret: "indomaret",
    alfamart: "alfamaret",
  };
  return map[method] || "qris";
}

// ---------------------------------------------------------------------------
// MAIN HANDLER
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { package: pkg, paymentMethod, prdId } = body;

    if (!pkg || !paymentMethod || (prdId !== undefined && (typeof prdId !== "string" || !prdId))) {
      return NextResponse.json(
        { error: "Package dan metode pembayaran wajib diisi" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk untuk membuat pembayaran" }, { status: 401 });
    }

    const requestedPackage = pkg as PackageId;
    const dbPackageType = getDbPackageType(requestedPackage);
    const pricingConfig = PRICING[requestedPackage];
    if (!pricingConfig) {
      return NextResponse.json(
        { error: "Package tidak valid" },
        { status: 400 }
      );
    }
    const amount = pricingConfig.price;

    // New purchases are prepaid: a subscription is activated or a one-off
    // credit is granted only by the verified payment webhook. Keep document
    // linkage only for legacy unpaid drafts that still pass prdId.
    if (prdId) {
      const { data: document, error: documentError } = await supabaseAdmin
        .from("prd_documents")
        .select("id, user_id, package_type, is_paid")
        .eq("id", prdId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (documentError) throw documentError;
      if (!document) {
        return NextResponse.json({ error: "PRD tidak ditemukan atau bukan milik kamu" }, { status: 404 });
      }
      if (document.is_paid) {
        return NextResponse.json({ error: "PRD ini sudah memiliki akses penuh" }, { status: 409 });
      }
      if (document.package_type !== dbPackageType) {
        return NextResponse.json({ error: "Paket pembayaran tidak sesuai dengan PRD" }, { status: 400 });
      }
    }

    let pendingQuery = supabaseAdmin
      .from("payments")
      .select("id")
      .eq("status", "PENDING");
    pendingQuery = prdId
      ? pendingQuery.eq("prd_id", prdId)
      : pendingQuery.eq("user_id", user.id).eq("plan_id", requestedPackage).is("prd_id", null);
    const { data: pendingPayment, error: pendingPaymentError } = await pendingQuery.maybeSingle();
    if (pendingPaymentError) throw pendingPaymentError;
    if (pendingPayment) {
      return NextResponse.json(
        { error: "Masih ada pembayaran yang menunggu untuk pembelian ini" },
        { status: 409 }
      );
    }

    // Persist the order before contacting a gateway. A fast webhook can then
    // always find a PENDING payment, and a failed gateway call can be audited.
    // Keep the provider-facing order ID conservative: SumoPod's documented
    // examples use an alphanumeric, hyphen-only identifier. Package metadata
    // is already stored separately in the payment row.
    const externalId = `BPAI-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const { data: payment, error: paymentCreateError } = await supabaseAdmin
      .from("payments")
      .insert({
        external_id: externalId,
        user_id: user.id,
        prd_id: prdId || null,
        package_type: dbPackageType,
        plan_id: requestedPackage,
        amount,
        payment_method: paymentMethod,
        status: "PENDING",
        gateway: null,
      })
      .select("id")
      .single();
    if (paymentCreateError) throw paymentCreateError;

    // Coba gateway aktif secara berurutan, urut berdasarkan preferensi
    const gateways = getActiveGateways();

    // Mock is strictly local/development. Production must use a gateway with
    // a signed webhook implementation so a redirect cannot unlock a PRD.
    if (gateways.length === 0) {
      if (process.env.NODE_ENV === "production") {
        await supabaseAdmin
          .from("payments")
          .update({ status: "FAILED" })
          .eq("id", payment.id)
          .eq("status", "PENDING");
        return NextResponse.json(
          { error: "Gateway pembayaran belum dikonfigurasi" },
          { status: 503 }
        );
      }
      const invoice = {
        id: `INV-${Date.now()}`,
        external_id: externalId,
        amount,
        status: "PENDING",
        payment_method: paymentMethod,
        invoice_url: prdId ? `/preview/${prdId}?payment=pending` : "/dashboard?payment=pending",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        gateway: "mock",
      };

      const { error: gatewayUpdateError } = await supabaseAdmin
        .from("payments")
        .update({ gateway: "mock" })
        .eq("id", payment.id)
        .eq("status", "PENDING");
      if (gatewayUpdateError) throw gatewayUpdateError;

      return NextResponse.json({
        success: true,
        data: invoice,
        note: "Mode development. Aktifkan salah satu gateway: Midtrans, SumoPod, DOKU, atau Ipaymu dengan mengatur environment variable.",
        available_gateways: Object.keys(GATEWAYS),
      });
    }

    // Coba setiap gateway yang aktif
    let lastError: unknown;

    // Prioritaskan SumoPod sesuai provider yang dipilih untuk produk ini.
    const preferredOrder: (keyof typeof GATEWAYS)[] = ["sumopod", "midtrans", "doku", "ipaymu"];

    for (const gw of preferredOrder) {
      if (!isGatewayAvailable(gw)) continue;

      try {
        let result;
        switch (gw) {
          case "midtrans":
            result = await createMidtransInvoice(pkg, amount, paymentMethod, prdId || null, externalId);
            break;
          case "sumopod":
            result = await createSumopodInvoice(pkg, amount, paymentMethod, prdId || null, externalId);
            break;
          case "doku":
            result = await createDokuInvoice(pkg, amount, paymentMethod, prdId || null, externalId);
            break;
          case "ipaymu":
            result = await createIpaymuInvoice(pkg, amount, paymentMethod, prdId || null, externalId);
            break;
        }
        const { error: gatewayUpdateError } = await supabaseAdmin
          .from("payments")
          .update({ gateway: result.gateway || null })
          .eq("id", payment.id)
          .eq("status", "PENDING");
        if (gatewayUpdateError) throw gatewayUpdateError;

        return NextResponse.json({ success: true, data: result });
      } catch (err) {
        console.error(`${gw} error:`, err);
        lastError = err;
        // Lanjut ke gateway berikutnya
      }
    }

    // Semua gateway gagal
    console.error("All gateways failed:", lastError);
    await supabaseAdmin
      .from("payments")
      .update({ status: "FAILED" })
      .eq("id", payment.id)
      .eq("status", "PENDING");
    return NextResponse.json(
      {
        error: "Semua gateway pembayaran gagal. Silakan coba lagi nanti.",
        detail: lastError instanceof Error ? lastError.message : "Unknown error",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembayaran" },
      { status: 500 }
    );
  }
}
