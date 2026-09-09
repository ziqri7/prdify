-- Sprint C: transaction safety, Pro fair use, and server-only billing RPCs.
-- Run once in the Supabase SQL Editor for project buatpakeai.

CREATE OR REPLACE FUNCTION public.release_stale_generation_reservations(
  p_user_id UUID,
  p_max_age INTERVAL DEFAULT INTERVAL '15 minutes'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reservation public.generation_reservations%ROWTYPE;
  released_count INTEGER := 0;
BEGIN
  FOR reservation IN
    SELECT * FROM public.generation_reservations
    WHERE user_id = p_user_id
      AND status = 'reserved'
      AND created_at < NOW() - p_max_age
    FOR UPDATE
  LOOP
    IF reservation.source = 'subscription' THEN
      UPDATE public.subscriptions
      SET documents_used = GREATEST(documents_used - 1, 0)
      WHERE id = reservation.subscription_id;
    ELSE
      UPDATE public.prepaid_credits
      SET status = 'available', reserved_at = NULL
      WHERE id = reservation.credit_id AND status = 'reserved';
    END IF;

    UPDATE public.generation_reservations
    SET status = 'released', released_at = NOW()
    WHERE id = reservation.id;
    released_count := released_count + 1;
  END LOOP;

  RETURN released_count;
END;
$$;

DROP FUNCTION IF EXISTS public.reserve_generation_access(UUID);
CREATE FUNCTION public.reserve_generation_access(p_user_id UUID)
RETURNS TABLE(
  reservation_id UUID,
  plan_id TEXT,
  package_type TEXT,
  denial_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_subscription public.subscriptions%ROWTYPE;
  available_credit public.prepaid_credits%ROWTYPE;
  new_reservation UUID := gen_random_uuid();
  pro_generations_last_hour INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 0));
  PERFORM public.release_stale_generation_reservations(p_user_id);

  IF EXISTS (
    SELECT 1 FROM public.generation_reservations
    WHERE user_id = p_user_id AND status = 'reserved'
  ) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, 'generation_in_progress'::TEXT;
    RETURN;
  END IF;

  SELECT s.* INTO active_subscription
  FROM public.subscriptions AS s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND s.current_period_end > NOW()
    AND (s.document_limit IS NULL OR s.documents_used < s.document_limit)
  ORDER BY s.current_period_end DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    IF active_subscription.plan_id IN ('pro', 'pro_tahunan') THEN
      SELECT COUNT(*) INTO pro_generations_last_hour
      FROM public.generation_reservations
      WHERE user_id = p_user_id
        AND plan_id IN ('pro', 'pro_tahunan')
        AND status = 'finalized'
        AND finalized_at >= NOW() - INTERVAL '1 hour';
      IF pro_generations_last_hour >= 10 THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, 'fair_use_limit'::TEXT;
        RETURN;
      END IF;
    END IF;

    UPDATE public.subscriptions
    SET documents_used = documents_used + 1
    WHERE id = active_subscription.id;

    INSERT INTO public.generation_reservations (
      id, user_id, source, package_type, plan_id, subscription_id
    ) VALUES (
      new_reservation, p_user_id, 'subscription',
      CASE WHEN active_subscription.plan_id IN ('pro', 'pro_tahunan') THEN 'pro' ELSE 'basic' END,
      active_subscription.plan_id, active_subscription.id
    );

    RETURN QUERY SELECT new_reservation, active_subscription.plan_id,
      CASE WHEN active_subscription.plan_id IN ('pro', 'pro_tahunan') THEN 'pro' ELSE 'basic' END,
      NULL::TEXT;
    RETURN;
  END IF;

  SELECT c.* INTO available_credit
  FROM public.prepaid_credits AS c
  WHERE c.user_id = p_user_id AND c.status = 'available'
  ORDER BY c.created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    UPDATE public.prepaid_credits
    SET status = 'reserved', reserved_at = NOW()
    WHERE id = available_credit.id;

    INSERT INTO public.generation_reservations (
      id, user_id, source, package_type, plan_id, credit_id
    ) VALUES (
      new_reservation, p_user_id, 'prepaid_credit', 'basic', 'pay_per_use', available_credit.id
    );

    RETURN QUERY SELECT new_reservation, 'pay_per_use'::TEXT, 'basic'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, 'no_access'::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_subscription_quota(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_generation_access(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_generation_reservation(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_stale_generation_reservations(UUID, INTERVAL) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.settle_verified_payment(TEXT, TEXT, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_subscription_quota(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_generation_access(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_generation_reservation(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_stale_generation_reservations(UUID, INTERVAL) TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_verified_payment(TEXT, TEXT, INTEGER, TEXT) TO service_role;
