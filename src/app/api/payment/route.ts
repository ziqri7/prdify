import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { package: pkg, paymentMethod } = body;

    if (!pkg || !paymentMethod) {
      return NextResponse.json(
        { error: "Package and payment method are required" },
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
        { error: "Invalid package" },
        { status: 400 }
      );
    }

    // In production, create Xendit/Midtrans invoice here
    // For now, return mock invoice
    const invoice = {
      id: `INV-${Date.now()}`,
      amount,
      status: "PENDING",
      payment_method: paymentMethod,
      invoice_url: `https://checkout.xendit.co/invoice/${Date.now()}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembayaran" },
      { status: 500 }
    );
  }
}

// Xendit webhook handler
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { invoice_id, status } = body;

    // Verify payment status from Xendit
    // Update document payment status in database

    return NextResponse.json({
      success: true,
      message: "Payment status updated",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
