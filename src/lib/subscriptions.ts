import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PackageId } from "@/lib/constants";

type SubscriptionPlan = Exclude<PackageId, "pay_per_use">;

export type SubscriptionEntitlement = {
  planId: SubscriptionPlan;
  packageType: "basic" | "pro";
};

export type GenerationEntitlement = {
  reservationId: string;
  planId: PackageId;
  packageType: "basic" | "pro";
};

export type GenerationAccessDenied = {
  denied: true;
  reason: "generation_in_progress" | "fair_use_limit" | "no_access";
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

/**
 * Reserves exactly one paid generation source. The database chooses an active
 * subscription first and otherwise an available Pay Per Use credit. A caller
 * must release the reservation if generation or persistence fails.
 */
export async function reserveGenerationAccess(
  userId: string
): Promise<GenerationEntitlement | GenerationAccessDenied> {
  const { data, error } = await supabaseAdmin.rpc("reserve_generation_access", {
    p_user_id: userId,
  });
  if (error) throw error;

  const entitlement = data?.[0];
  if (!entitlement?.reservation_id) {
    const reason = entitlement?.denial_reason;
    return {
      denied: true,
      reason: reason === "generation_in_progress" || reason === "fair_use_limit"
        ? reason
        : "no_access",
    };
  }

  return {
    reservationId: entitlement.reservation_id as string,
    planId: entitlement.plan_id as PackageId,
    packageType: entitlement.package_type as "basic" | "pro",
  };
}

export async function releaseGenerationReservation(reservationId: string, userId: string) {
  const { error } = await supabaseAdmin.rpc("release_generation_reservation", {
    p_reservation_id: reservationId,
    p_user_id: userId,
  });
  if (error) throw error;
}

/** Adds one Pay Per Use credit exactly once because payment_id is unique. */
export async function grantPrepaidCreditForPayment({
  userId,
  paymentId,
}: {
  userId: string;
  paymentId: string;
}) {
  const { error } = await supabaseAdmin
    .from("prepaid_credits")
    .upsert(
      { user_id: userId, payment_id: paymentId, status: "available" },
      { onConflict: "payment_id", ignoreDuplicates: true }
    );
  if (error) throw error;
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
    // A subscription is now purchased before the first AI generation.
    documents_used: 0,
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
