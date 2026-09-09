import { NextResponse } from "next/server";
import {
  applyVerifiedPayment,
  verifyDevelopmentMockWebhook,
  verifyMidtransWebhook,
  verifySumopodWebhook,
} from "@/lib/payment-webhook";

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext<"/api/payment/webhook/[gateway]">) {
  const { gateway } = await context.params;
  const rawBody = await request.text();

  const notification = gateway === "midtrans"
    ? verifyMidtransWebhook(rawBody)
    : gateway === "sumopod"
      ? verifySumopodWebhook(request, rawBody)
    : gateway === "mock"
      ? verifyDevelopmentMockWebhook(request, rawBody)
      : null;

  if (!notification) {
    return NextResponse.json({ error: "Notifikasi pembayaran tidak dapat diverifikasi" }, { status: 401 });
  }

  try {
    const applied = await applyVerifiedPayment(notification);
    if (!applied) {
      // Return a generic response: unknown order details are not exposed to callers.
      return NextResponse.json({ error: "Notifikasi pembayaran tidak dapat diproses" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: "Gagal memproses notifikasi pembayaran" }, { status: 500 });
  }
}
