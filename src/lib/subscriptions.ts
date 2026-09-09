import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PackageId } from "@/lib/constants";

type SubscriptionPlan = Exclude<PackageId, "pay_per_use">;

export type SubscriptionEntitlement = {
  planId: SubscriptionPlan;
  packageType: "basic" | "pro";
};

function isSubscriptionPlan(planId: PackageId): planId is SubscriptionPlan {
  return planId !== "pay_per_use";
}

export async function consumeSubscriptionQuota(userId: string): Promise<SubscriptionEntitlement | null> {
  const { data, error } = await supabaseAdmin.rpc("consume_subscription_quota", {
    p_user_id: userId,
  });

  if (error) throw error;
  const entitlement = data?.[0];
  if (!entitlement) return null;

  return {
    planId: entitlement.plan_id as SubscriptionPlan,
    packageType: entitlement.package_type as "basic" | "pro",
  };
}

export async function activateSubscriptionForPayment({
  userId,
  paymentId,
  planId,
}: {
  userId: string;
  paymentId: string;
  planId: PackageId;
}) {
  if (!isSubscriptionPlan(planId)) return null;

  const now = new Date();
  const periodEnd = new Date(now);
  const isAnnual = planId === "pro_tahunan";
  if (isAnnual) periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  const documentLimit = planId === "starter" ? 5 : null;
  const { data: current, error: currentError } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (currentError) throw currentError;

  const values = {
    plan_id: planId,
    status: "active",
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    documents_used: 1,
    document_limit: documentLimit,
    payment_id: paymentId,
  };

  if (current) {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update(values)
      .eq("id", current.id);
    if (error) throw error;
    return current.id;
  }

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .insert({ user_id: userId, ...values })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
