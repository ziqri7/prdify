import { createHash, createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { activateSubscriptionForPayment } from "@/lib/subscriptions";

type VerifiedPayment = {
  externalId: string;
  amount: number;
  status: "PAID" | "FAILED" | "EXPIRED";
  gateway: "midtrans" | "sumopod" | "mock";
};

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyMidtransWebhook(rawBody: string): VerifiedPayment | null {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return null;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return null;
  }

  const orderId = typeof payload.order_id === "string" ? payload.order_id : null;
  const statusCode = typeof payload.status_code === "string" ? payload.status_code : null;
  const grossAmount = typeof payload.gross_amount === "string" || typeof payload.gross_amount === "number"
    ? String(payload.gross_amount)
    : null;
  const signature = typeof payload.signature_key === "string" ? payload.signature_key : null;
  const transactionStatus = typeof payload.transaction_status === "string" ? payload.transaction_status : null;
  const fraudStatus = typeof payload.fraud_status === "string" ? payload.fraud_status : "";

  if (!orderId || !statusCode || !grossAmount || !signature || !transactionStatus) return null;

  const expectedSignature = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  if (!secureEqual(signature, expectedSignature)) return null;

  let status: VerifiedPayment["status"] | null = null;
  if (
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept")
  ) {
    status = "PAID";
  } else if (transactionStatus === "expire") {
    status = "EXPIRED";
  } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "failure") {
    status = "FAILED";
  }

  const amount = Number(grossAmount);
  if (!status || !Number.isSafeInteger(amount) || amount <= 0) return null;

  return { externalId: orderId, amount, status, gateway: "midtrans" };
}

/** Verifies SumoPod's Svix-compatible signature against the raw request body. */
export function verifySumopodWebhook(request: Request, rawBody: string): VerifiedPayment | null {
  const secret = process.env.SUMOPOD_WEBHOOK_SECRET;
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!secret || !svixId || !svixTimestamp || !svixSignature) return null;

  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  } catch {
    return null;
  }

  const expected = createHmac("sha256", secretBytes)
    .update(`${svixId}.${svixTimestamp}.${rawBody}`)
    .digest("base64");
  const valid = svixSignature
    .split(" ")
    .map((entry) => entry.split(",")[1])
    .filter((signature): signature is string => Boolean(signature))
    .some((signature) => secureEqual(signature, expected));
  if (!valid) return null;

  try {
    const payload = JSON.parse(rawBody) as {
      event_type?: unknown;
      data?: { order_id?: unknown; amount?: unknown };
    };
    const event = payload.event_type;
    const externalId = typeof payload.data?.order_id === "string" ? payload.data.order_id : null;
    const amount = typeof payload.data?.amount === "number" ? payload.data.amount : null;
    const status = event === "payment.completed"
      ? "PAID"
      : event === "payment.failed"
        ? "FAILED"
        : event === "payment.expired"
          ? "EXPIRED"
          : null;
    if (!externalId || !amount || !Number.isSafeInteger(amount) || !status) return null;
    return { externalId, amount, status, gateway: "sumopod" };
  } catch {
    return null;
  }
}

export function verifyDevelopmentMockWebhook(request: Request, rawBody: string): VerifiedPayment | null {
  if (process.env.NODE_ENV === "production") return null;

  const secret = process.env.PAYMENT_MOCK_WEBHOOK_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || !authorization || !secureEqual(authorization, `Bearer ${secret}`)) return null;

  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const externalId = typeof payload.external_id === "string" ? payload.external_id : null;
    const amount = typeof payload.paid_amount === "number" ? payload.paid_amount : null;
    const status = payload.status;
    if (!externalId || !amount || !Number.isSafeInteger(amount) || status !== "PAID") return null;
    return { externalId, amount, status, gateway: "mock" };
  } catch {
    return null;
  }
}

/** Applies only a verified gateway notification and never trusts its supplied PRD id. */
export async function applyVerifiedPayment(notification: VerifiedPayment) {
  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .select("id, user_id, prd_id, plan_id, amount, status, gateway")
    .eq("external_id", notification.externalId)
    .maybeSingle();

  if (error) throw error;
  if (!payment || payment.gateway !== notification.gateway || payment.amount !== notification.amount) {
    return false;
  }

  // A successful payment is final. Do not permit later notifications to revoke access.
  if (payment.status === "PAID") return true;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("payments")
    .update({
      status: notification.status,
      paid_at: notification.status === "PAID" ? new Date().toISOString() : null,
    })
    .eq("id", payment.id)
    .eq("status", "PENDING")
    .select("id, prd_id")
    .maybeSingle();

  if (updateError) throw updateError;
  if (!updated) return false;

  if (notification.status === "PAID" && updated.prd_id) {
    const { error: documentError } = await supabaseAdmin
      .from("prd_documents")
      .update({ is_paid: true, payment_id: updated.id })
      .eq("id", updated.prd_id);
    if (documentError) throw documentError;
  }

  if (notification.status === "PAID" && payment.user_id) {
    await activateSubscriptionForPayment({
      userId: payment.user_id,
      paymentId: payment.id,
      planId: payment.plan_id,
    });
  }

  return true;
}
