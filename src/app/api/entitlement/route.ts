import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { data: subscription, error: subscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_id, current_period_end, documents_used, document_limit")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("current_period_end", now)
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (subscriptionError) {
    return NextResponse.json({ error: "Gagal memeriksa paket" }, { status: 500 });
  }

  if (
    subscription &&
    (subscription.document_limit === null || subscription.documents_used < subscription.document_limit)
  ) {
    return NextResponse.json({
      data: { planId: subscription.plan_id, source: "subscription" },
    });
  }

  const { data: credit, error: creditError } = await supabaseAdmin
    .from("prepaid_credits")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "available")
    .limit(1)
    .maybeSingle();
  if (creditError) {
    return NextResponse.json({ error: "Gagal memeriksa kredit" }, { status: 500 });
  }

  return NextResponse.json({
    data: credit ? { planId: "pay_per_use", source: "prepaid_credit" } : null,
  });
}
