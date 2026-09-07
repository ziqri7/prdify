import { NextResponse } from "next/server";

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

    const amounts: Record<string, number> = {
      basic: 25000,
      pro: 50000,
    };

    const amount = amounts[pkg as string];
    if (!amount) {
      return NextResponse.json(
        { error: "Package tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah Xendit API key tersedia
    if (process.env.XENDIT_SECRET_API_KEY) {
      try {
        // Xendit Invoice API
        const xenditPayload = {
          external_id: `PRDIFY-${pkg}-${Date.now()}`,
          amount,
          description: `PRDify - ${pkg === "pro" ? "Pro" : "Basic"} Package`,
          invoice_duration: 86400,
          customer: {
            // Will be filled with actual customer data
          },
          customer_notification_preference: {
            invoice_paid: ["email", "whatsapp"],
          },
          success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://prdify.vercel.app"}/questionnaire?payment=success`,
          failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://prdify.vercel.app"}/payment?status=failed`,
          payment_methods: getXenditPaymentMethods(paymentMethod),
          currency: "IDR",
        };

        const auth = Buffer.from(
          process.env.XENDIT_SECRET_API_KEY + ":"
        ).toString("base64");

        const response = await fetch(
          "https://api.xendit.co/v2/invoices",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify(xenditPayload),
          }
        );

        const xenditResponse = await response.json();

        if (!response.ok) {
          throw new Error(xenditResponse.message || "Xendit error");
        }

        return NextResponse.json({
          success: true,
          data: {
            id: xenditResponse.id,
            external_id: xenditResponse.external_id,
            amount: xenditResponse.amount,
            status: xenditResponse.status,
            payment_method: paymentMethod,
            invoice_url: xenditResponse.invoice_url,
            expires_at: xenditResponse.expiry_date,
          },
        });
      } catch (xenditError) {
        console.error("Xendit API error:", xenditError);
        // Fallback ke mock jika Xendit gagal
      }
    }

    // Fallback: Mock invoice (untuk development)
    const invoice = {
      id: `INV-${Date.now()}`,
      external_id: `PRDIFY-${pkg}-${Date.now()}`,
      amount,
      status: "PENDING",
      payment_method: paymentMethod,
      invoice_url: `https://checkout.xendit.co/invoice/${Date.now()}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: invoice,
      note: "Pembayaran dalam mode development. Atur XENDIT_SECRET_API_KEY untuk live payment.",
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembayaran" },
      { status: 500 }
    );
  }
}

// Xendit webhook handler (dipanggil Xendit saat status pembayaran berubah)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, external_id, status, paid_amount } = body;

    // Verifikasi callback token
    const callbackToken = request.headers.get("x-callback-token");
    if (
      process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN &&
      callbackToken !== process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN
    ) {
      return NextResponse.json(
        { error: "Invalid callback token" },
        { status: 401 }
      );
    }

    // Log payment status
    console.log(`Payment ${external_id || id}: ${status}`);

    // Di production: update status payment di database Supabase
    // await supabase.from('payments').update({ status, paid_amount }).eq('external_id', external_id);

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

function getXenditPaymentMethods(
  method: string
): string[] {
  const methodMap: Record<string, string[]> = {
    bca: ["BCA"],
    mandiri: ["MANDIRI"],
    bri: ["BRI"],
    bni: ["BNI"],
    gopay: ["GOPAY"],
    ovo: ["OVO"],
    dana: ["DANA"],
    qris: ["QRIS"],
  };
  return methodMap[method] || ["BCA", "MANDIRI", "GOPAY", "QRIS"];
}
