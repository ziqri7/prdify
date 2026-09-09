import { NextResponse } from "next/server";
import { createHash } from "crypto";
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
async function createMidtransInvoice(pkg: string, amount: number, paymentMethod: string, prdId: string) {
  const orderId = `BPAI-${pkg}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";

  const payload: Record<string, unknown> = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    credit_card: { secure: true },
    customer_details: {},
    enabled_payments: getMidtransPaymentMethods(paymentMethod),
    callbacks: {
      finish: `${appUrl}/preview/${prdId}?payment=success`,
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
    external_id: orderId,
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
async function createSumopodInvoice(pkg: string, amount: number, paymentMethod: string, prdId: string) {
  const orderId = `BPAI-${pkg}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";

  const payload = {
    order_id: orderId,
    amount,
    currency: "IDR",
    expires_in_hours: 24,
    success_return_url: `${appUrl}/preview/${prdId}?payment=success`,
    cancel_return_url: `${appUrl}/payment?status=failed`,
    description: `BuatPakeAI - ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"} Package`,
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

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "SumoPod error");

  return {
    id: data.id || orderId,
    external_id: orderId,
    amount,
    status: data.status || "PENDING",
    payment_method: paymentMethod,
    invoice_url: data.payment_link_url || data.url,
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
async function createDokuInvoice(pkg: string, amount: number, paymentMethod: string, prdId: string) {
  const externalId = `BPAI-${pkg}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";

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
      url_success: `${appUrl}/preview/${prdId}?payment=success`,
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
async function createIpaymuInvoice(pkg: string, amount: number, paymentMethod: string, prdId: string) {
  const externalId = `BPAI-${pkg}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";

  const body = new URLSearchParams();
  body.append("product", `BuatPakeAI ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"}`);
  body.append("qty", "1");
  body.append("price", amount.toString());
  body.append("description", `PRD - ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"} Package`);
  body.append("returnUrl", `${appUrl}/preview/${prdId}?payment=success`);
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

    if (!pkg || !paymentMethod || !prdId || typeof prdId !== "string") {
      return NextResponse.json(
        { error: "Package, PRD, dan metode pembayaran wajib diisi" },
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

    // An invoice may only unlock a document owned by the authenticated customer.
    // The server derives every other document attribute; none are trusted from the client.
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

    const { data: pendingPayment, error: pendingPaymentError } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("prd_id", prdId)
      .eq("status", "PENDING")
      .maybeSingle();
    if (pendingPaymentError) throw pendingPaymentError;
    if (pendingPayment) {
      return NextResponse.json(
        { error: "Masih ada pembayaran yang menunggu untuk PRD ini" },
        { status: 409 }
      );
    }

    // Coba gateway aktif secara berurutan, urut berdasarkan preferensi
    const gateways = getActiveGateways();

    // Mock is strictly local/development. Production must use a gateway with
    // a signed webhook implementation so a redirect cannot unlock a PRD.
    if (gateways.length === 0) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Gateway pembayaran belum dikonfigurasi" },
          { status: 503 }
        );
      }
      const invoice = {
        id: `INV-${Date.now()}`,
        external_id: `BPAI-${pkg}-${Date.now()}`,
        amount,
        status: "PENDING",
        payment_method: paymentMethod,
        invoice_url: `/preview/${prdId}?payment=pending`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        gateway: "mock",
      };

      // Simpan record payment ke database
      try {
        await supabaseAdmin.from('payments').insert({
          external_id: invoice.external_id,
          user_id: user.id,
          prd_id: prdId,
          package_type: dbPackageType,
          plan_id: requestedPackage,
          amount,
          payment_method: paymentMethod,
          status: 'PENDING',
          gateway: 'mock',
        });
      } catch (e) {
        console.error('Failed to save payment:', e);
      }

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
            result = await createMidtransInvoice(pkg, amount, paymentMethod, prdId);
            break;
          case "sumopod":
            result = await createSumopodInvoice(pkg, amount, paymentMethod, prdId);
            break;
          case "doku":
            result = await createDokuInvoice(pkg, amount, paymentMethod, prdId);
            break;
          case "ipaymu":
            result = await createIpaymuInvoice(pkg, amount, paymentMethod, prdId);
            break;
        }
        // Simpan record payment ke database
        if (typeof result.external_id !== 'undefined') {
          try {
            await supabaseAdmin.from('payments').insert({
              external_id: result.external_id,
              user_id: user.id,
              prd_id: prdId,
              package_type: dbPackageType,
              plan_id: requestedPackage,
              amount,
              payment_method: paymentMethod,
              status: 'PENDING',
              gateway: result.gateway || null,
            });
          } catch (e) {
            console.error('Failed to save payment:', e);
          }
        }

        return NextResponse.json({ success: true, data: result });
      } catch (err) {
        console.error(`${gw} error:`, err);
        lastError = err;
        // Lanjut ke gateway berikutnya
      }
    }

    // Semua gateway gagal
    console.error("All gateways failed:", lastError);
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
