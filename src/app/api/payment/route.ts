import { NextResponse } from "next/server";
import { PRICING, getDbPackageType } from "@/lib/constants";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Gateway configuration — enable whichever gateway(s) you use */
const GATEWAYS = {
  midtrans: !!process.env.MIDTRANS_SERVER_KEY,
  sumopod: !!process.env.SUMOPOD_API_KEY,
  doku: !!process.env.DOKU_CLIENT_ID,
  ipaymu: !!process.env.IPAYMU_API_KEY,
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
async function createMidtransInvoice(pkg: string, amount: number, paymentMethod: string) {
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
      finish: `${appUrl}/questionnaire?payment=success`,
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
async function createSumopodInvoice(pkg: string, amount: number, paymentMethod: string) {
  const orderId = `BPAI-${pkg}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";

  const payload = {
    order_id: orderId,
    amount,
    currency: "IDR",
    expires_in_hours: 24,
    success_return_url: `${appUrl}/questionnaire?payment=success`,
    cancel_return_url: `${appUrl}/payment?status=failed`,
    notification_url: `${appUrl}/api/payment`,
    description: `BuatPakeAI - ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"} Package`,
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

// ---------------------------------------------------------------------------
// DOKU
// ---------------------------------------------------------------------------
async function createDokuInvoice(pkg: string, amount: number, paymentMethod: string) {
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
      callback_url: `${appUrl}/api/payment`,
      auto_redirect: true,
      url_failed: `${appUrl}/payment?status=failed`,
      url_success: `${appUrl}/questionnaire?payment=success`,
      notify_url: `${appUrl}/api/payment`,
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
async function createIpaymuInvoice(pkg: string, amount: number, paymentMethod: string) {
  const externalId = `BPAI-${pkg}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buatpakeai.vercel.app";

  const body = new URLSearchParams();
  body.append("product", `BuatPakeAI ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"}`);
  body.append("qty", "1");
  body.append("price", amount.toString());
  body.append("description", `PRD - ${PRICING[pkg as keyof typeof PRICING]?.name || "Paket"} Package`);
  body.append("returnUrl", `${appUrl}/questionnaire?payment=success`);
  body.append("cancelUrl", `${appUrl}/payment?status=failed`);
  body.append("notifyUrl", `${appUrl}/api/payment`);
  body.append("referenceId", externalId);
  body.append("paymentMethod", getIpaymuPaymentMethod(paymentMethod));

  const hash = require("crypto")
    .createHash("sha256")
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
    const { package: pkg, paymentMethod } = body;

    if (!pkg || !paymentMethod) {
      return NextResponse.json(
        { error: "Package dan metode pembayaran wajib diisi" },
        { status: 400 }
      );
    }

    const dbPackageType = getDbPackageType(pkg as any);
    const pricingConfig = PRICING[pkg as keyof typeof PRICING];
    if (!pricingConfig) {
      return NextResponse.json(
        { error: "Package tidak valid" },
        { status: 400 }
      );
    }
    const amount = pricingConfig.price;

    // Coba gateway aktif secara berurutan, urut berdasarkan preferensi
    const gateways = getActiveGateways();

    // Jika tidak ada gateway aktif, fallback ke mock
    if (gateways.length === 0) {
      const invoice = {
        id: `INV-${Date.now()}`,
        external_id: `BPAI-${pkg}-${Date.now()}`,
        amount,
        status: "PENDING",
        payment_method: paymentMethod,
        invoice_url: "#",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        gateway: "mock",
      };

      // Simpan record payment ke database
      try {
        await supabaseAdmin.from('payments').insert({
          external_id: invoice.external_id,
          package_type: dbPackageType,
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

    // Prioritaskan gateway: midtrans > sumopod > doku > ipaymu
    const preferredOrder: (keyof typeof GATEWAYS)[] = ["midtrans", "sumopod", "doku", "ipaymu"];

    for (const gw of preferredOrder) {
      if (!isGatewayAvailable(gw)) continue;

      try {
        let result;
        switch (gw) {
          case "midtrans":
            result = await createMidtransInvoice(pkg, amount, paymentMethod);
            break;
          case "sumopod":
            result = await createSumopodInvoice(pkg, amount, paymentMethod);
            break;
          case "doku":
            result = await createDokuInvoice(pkg, amount, paymentMethod);
            break;
          case "ipaymu":
            result = await createIpaymuInvoice(pkg, amount, paymentMethod);
            break;
        }
        // Simpan record payment ke database
        if (typeof result.external_id !== 'undefined') {
          try {
            await supabaseAdmin.from('payments').insert({
              external_id: result.external_id,
              package_type: dbPackageType,
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

// Webhook handler untuk semua gateway
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, external_id, status, paid_amount, gateway } = body;

    // Cari payment by external_id
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('id, prd_id')
      .eq('external_id', external_id)
      .single();

    if (payment) {
      // Update payment status
      await supabaseAdmin
        .from('payments')
        .update({
          status,
          paid_at: status === 'PAID' ? new Date().toISOString() : null,
          gateway: gateway || null,
        })
        .eq('external_id', external_id);

      // If paid, unlock the PRD
      if (status === 'PAID' && payment.prd_id) {
        await supabaseAdmin
          .from('prd_documents')
          .update({ is_paid: true, payment_id: payment.id })
          .eq('id', payment.prd_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Status pembayaran berhasil diperbarui",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Gagal memproses webhook" },
      { status: 500 }
    );
  }
}
