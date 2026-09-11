-- Production readiness: payment status allowlist for verified webhooks.
-- Safe for a project that has already run the existing schema and Sprint C
-- migration: this preserves the function signature and only replaces its body.

CREATE OR REPLACE FUNCTION public.settle_verified_payment(
  p_external_id TEXT,
  p_gateway TEXT,
  p_amount INTEGER,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_row public.payments%ROWTYPE;
  current_subscription UUID;
  period_end TIMESTAMPTZ;
  document_limit_value INTEGER;
BEGIN
  -- Verified gateway adapters may only settle these terminal states. Reject
  -- unknown values before reading or mutating an order as defence in depth.
  IF p_status IS NULL OR p_status NOT IN ('PAID', 'FAILED', 'EXPIRED') THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO payment_row
  FROM public.payments
  WHERE external_id = p_external_id
  FOR UPDATE;

  IF NOT FOUND
    OR payment_row.gateway IS DISTINCT FROM p_gateway
    OR payment_row.amount <> p_amount THEN
    RETURN FALSE;
  END IF;

  IF payment_row.status = 'PAID' THEN
    RETURN TRUE;
  END IF;
  IF payment_row.status <> 'PENDING' THEN
    RETURN FALSE;
  END IF;

  UPDATE public.payments
  SET status = p_status,
      paid_at = CASE WHEN p_status = 'PAID' THEN NOW() ELSE NULL END
  WHERE id = payment_row.id;

  IF p_status <> 'PAID' THEN
    RETURN TRUE;
  END IF;

  IF payment_row.prd_id IS NOT NULL THEN
    UPDATE public.prd_documents
    SET is_paid = TRUE, payment_id = payment_row.id::TEXT
    WHERE id = payment_row.prd_id;
  END IF;

  IF payment_row.plan_id = 'pay_per_use' AND payment_row.prd_id IS NULL THEN
    INSERT INTO public.prepaid_credits (user_id, payment_id, status)
    VALUES (payment_row.user_id, payment_row.id, 'available')
    ON CONFLICT (payment_id) DO NOTHING;
    RETURN TRUE;
  END IF;

  IF payment_row.plan_id IN ('starter', 'pro', 'pro_tahunan') THEN
    period_end := NOW() + CASE
      WHEN payment_row.plan_id = 'pro_tahunan' THEN INTERVAL '1 year'
      ELSE INTERVAL '1 month'
    END;
    document_limit_value := CASE WHEN payment_row.plan_id = 'starter' THEN 5 ELSE NULL END;

    SELECT id INTO current_subscription
    FROM public.subscriptions
    WHERE user_id = payment_row.user_id AND status = 'active'
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.subscriptions
      SET plan_id = payment_row.plan_id,
          current_period_start = NOW(),
          current_period_end = period_end,
          documents_used = 0,
          document_limit = document_limit_value,
          payment_id = payment_row.id
      WHERE id = current_subscription;
    ELSE
      INSERT INTO public.subscriptions (
        user_id, plan_id, status, current_period_start, current_period_end,
        documents_used, document_limit, payment_id
      ) VALUES (
        payment_row.user_id, payment_row.plan_id, 'active', NOW(), period_end,
        0, document_limit_value, payment_row.id
      );
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- Reassert least privilege in case a manual change restored public execution
-- rights after Sprint C. The guards keep this migration safe to run on an older
-- database while the earlier migration is being applied in the same sequence.
DO $$
BEGIN
  IF to_regprocedure('public.reserve_generation_access(uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.reserve_generation_access(UUID) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.reserve_generation_access(UUID) TO service_role';
  END IF;

  IF to_regprocedure('public.release_generation_reservation(uuid,uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.release_generation_reservation(UUID, UUID) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.release_generation_reservation(UUID, UUID) TO service_role';
  END IF;

  IF to_regprocedure('public.release_stale_generation_reservations(uuid,interval)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.release_stale_generation_reservations(UUID, INTERVAL) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.release_stale_generation_reservations(UUID, INTERVAL) TO service_role';
  END IF;

  EXECUTE 'REVOKE ALL ON FUNCTION public.settle_verified_payment(TEXT, TEXT, INTEGER, TEXT) FROM PUBLIC, anon, authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.settle_verified_payment(TEXT, TEXT, INTEGER, TEXT) TO service_role';
END;
$$;
