-- ============================================================
-- Schema Database Supabase untuk PRDify
-- Buka https://supabase.com → SQL Editor → Paste & Run
-- ============================================================

-- 1. TABEL PROFIL USER (otomatis terisi via Auth trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: user bisa baca & edit profil sendiri
CREATE POLICY "User dapat membaca profil sendiri"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "User dapat mengupdate profil sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profil saat user registrasi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for auth users created before the trigger was installed.
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(COALESCE(u.email, ''), '@', 1)),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
FROM auth.users AS u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;


-- 2. TABEL PRD (dokumen yang dihasilkan)
CREATE TABLE IF NOT EXISTS public.prd_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'pro')),
  answers JSONB NOT NULL DEFAULT '{}',
  markdown_content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  is_paid BOOLEAN DEFAULT FALSE,
  payment_id TEXT,
  session_id TEXT, -- untuk user tanpa login
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian
CREATE INDEX IF NOT EXISTS idx_prd_user_id ON public.prd_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_prd_session_id ON public.prd_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_prd_created_at ON public.prd_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prd_status ON public.prd_documents(status);

ALTER TABLE public.prd_documents ENABLE ROW LEVEL SECURITY;

-- Policy: user bisa lihat PRD miliknya sendiri
CREATE POLICY "User dapat melihat PRD sendiri"
  ON public.prd_documents FOR SELECT
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "User dapat membuat PRD"
  ON public.prd_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "User dapat mengupdate PRD sendiri"
  ON public.prd_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "User dapat menghapus PRD sendiri"
  ON public.prd_documents FOR DELETE
  USING (auth.uid() = user_id);


-- 3. TABEL PEMBAYARAN
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  prd_id UUID REFERENCES public.prd_documents(id) ON DELETE SET NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'pro')),
  plan_id TEXT NOT NULL DEFAULT 'pay_per_use' CHECK (plan_id IN ('pay_per_use', 'starter', 'pro', 'pro_tahunan')),
  amount INTEGER NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED')),
  gateway TEXT,
  xendit_invoice_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe for databases created with an earlier version of this schema.
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS plan_id TEXT NOT NULL DEFAULT 'pay_per_use';
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_plan_id_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_plan_id_check
  CHECK (plan_id IN ('pay_per_use', 'starter', 'pro', 'pro_tahunan'));

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON public.payments(external_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_one_open_payment_per_prd
  ON public.payments(prd_id)
  WHERE prd_id IS NOT NULL AND status IN ('PENDING', 'PAID');
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_one_pending_plan_per_user
  ON public.payments(user_id, plan_id)
  WHERE prd_id IS NULL AND status = 'PENDING';

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User dapat melihat pembayaran sendiri"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System dapat membuat pembayaran"
  ON public.payments FOR INSERT
  WITH CHECK (true);


-- 3b. LANGGANAN & KUOTA DOKUMEN
-- Billing provider may change, but access is always enforced from this table.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('starter', 'pro', 'pro_tahunan')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  documents_used INTEGER NOT NULL DEFAULT 0 CHECK (documents_used >= 0),
  document_limit INTEGER,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_period
  ON public.subscriptions(user_id, current_period_end DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_user
  ON public.subscriptions(user_id)
  WHERE status = 'active';

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User dapat melihat langganan sendiri"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Atomically reserve one document from the current active subscription.
-- It returns no row when a plan has expired or Starter has reached its quota.
CREATE OR REPLACE FUNCTION public.consume_subscription_quota(p_user_id UUID)
RETURNS TABLE(plan_id TEXT, package_type TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH eligible AS (
    SELECT s.id, s.plan_id
    FROM public.subscriptions AS s
    WHERE s.user_id = p_user_id
      AND s.status = 'active'
      AND s.current_period_end > NOW()
      AND (s.document_limit IS NULL OR s.documents_used < s.document_limit)
    ORDER BY s.current_period_end DESC
    LIMIT 1
    FOR UPDATE
  ), consumed AS (
    UPDATE public.subscriptions s
    SET documents_used = s.documents_used + 1
    FROM eligible e
    WHERE s.id = e.id
    RETURNING s.plan_id
  )
  SELECT c.plan_id,
    CASE WHEN c.plan_id IN ('pro', 'pro_tahunan') THEN 'pro' ELSE 'basic' END
  FROM consumed c;
END;
$$;

-- 3c. KREDIT PRABAYAR & RESERVASI GENERASI
-- Pay Per Use memberikan satu kredit setelah webhook pembayaran tervalidasi.
-- Kredit dan kuota langganan selalu direservasi di database sebelum generator
-- dipanggil, sehingga klik ganda tidak dapat memakai akses yang sama dua kali.
CREATE TABLE IF NOT EXISTS public.prepaid_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL UNIQUE REFERENCES public.payments(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'consumed')),
  reserved_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prepaid_credits_available
  ON public.prepaid_credits(user_id, created_at)
  WHERE status = 'available';

ALTER TABLE public.prepaid_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User dapat melihat kredit sendiri"
  ON public.prepaid_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.generation_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('subscription', 'prepaid_credit')),
  package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'pro')),
  plan_id TEXT NOT NULL CHECK (plan_id IN ('pay_per_use', 'starter', 'pro', 'pro_tahunan')),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE RESTRICT,
  credit_id UUID REFERENCES public.prepaid_credits(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'finalized', 'released')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  CONSTRAINT generation_reservations_source_integrity CHECK (
    (source = 'subscription' AND subscription_id IS NOT NULL AND credit_id IS NULL)
    OR (source = 'prepaid_credit' AND credit_id IS NOT NULL AND subscription_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_generation_reservations_user_status
  ON public.generation_reservations(user_id, status);

ALTER TABLE public.generation_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User dapat melihat reservasi sendiri"
  ON public.generation_reservations FOR SELECT
  USING (auth.uid() = user_id);

-- Link a document to the reservation that paid for its generation. The trigger
-- below finalizes the reservation in the same transaction as document insert.
ALTER TABLE public.prd_documents
  ADD COLUMN IF NOT EXISTS generation_reservation_id UUID
  REFERENCES public.generation_reservations(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_prd_generation_reservation
  ON public.prd_documents(generation_reservation_id)
  WHERE generation_reservation_id IS NOT NULL;

-- Releases reservations abandoned by an interrupted server request. This also
-- restores the subscription counter or prepaid credit before a user can retry.
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

-- A user may have only one active AI generation. Pro remains unmetered by
-- month, but fair use protects capacity with a rolling hourly ceiling.
-- The return shape includes a denial reason in this version, so remove the
-- preceding function signature before recreating it on an existing project.
DROP FUNCTION IF EXISTS public.reserve_generation_access(UUID);
CREATE OR REPLACE FUNCTION public.reserve_generation_access(p_user_id UUID)
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
  -- Serializes all reservation attempts for one user, so double clicks and
  -- parallel browser tabs cannot reserve more than one generation at once.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 0));
  PERFORM public.release_stale_generation_reservations(p_user_id);

  IF EXISTS (
    SELECT 1 FROM public.generation_reservations
    WHERE user_id = p_user_id AND status = 'reserved'
  ) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, 'generation_in_progress'::TEXT;
    RETURN;
  END IF;

  -- Prefer an active subscription, then fall back to a one-off paid credit.
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
      new_reservation,
      p_user_id,
      'subscription',
      CASE WHEN active_subscription.plan_id IN ('pro', 'pro_tahunan') THEN 'pro' ELSE 'basic' END,
      active_subscription.plan_id,
      active_subscription.id
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

CREATE OR REPLACE FUNCTION public.release_generation_reservation(
  p_reservation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reservation public.generation_reservations%ROWTYPE;
BEGIN
  SELECT * INTO reservation
  FROM public.generation_reservations
  WHERE id = p_reservation_id AND user_id = p_user_id AND status = 'reserved'
  FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

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
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_generation_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reservation public.generation_reservations%ROWTYPE;
BEGIN
  IF NEW.generation_reservation_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO reservation
  FROM public.generation_reservations
  WHERE id = NEW.generation_reservation_id
    AND user_id = NEW.user_id
    AND status = 'reserved'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Generation reservation is invalid or no longer available';
  END IF;

  IF reservation.source = 'prepaid_credit' THEN
    UPDATE public.prepaid_credits
    SET status = 'consumed', consumed_at = NOW()
    WHERE id = reservation.credit_id AND status = 'reserved';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Prepaid credit is no longer reserved';
    END IF;
  END IF;

  UPDATE public.generation_reservations
  SET status = 'finalized', finalized_at = NOW()
  WHERE id = reservation.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS finalize_generation_reservation_on_document ON public.prd_documents;
CREATE TRIGGER finalize_generation_reservation_on_document
  BEFORE INSERT ON public.prd_documents
  FOR EACH ROW EXECUTE FUNCTION public.finalize_generation_reservation();

-- Applies a verified gateway notification and grants its entitlement in one
-- transaction. Retried webhooks are idempotent: a PAID payment stays PAID and
-- never grants a second credit or subscription period.
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

-- These routines are server-only. The public browser roles must not be able
-- to reserve other users' quota or mark a payment as settled through RPC.
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


-- 4. FUNGSI & TRIGGER: Update updated_at otomatis
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_prd_updated_at
  BEFORE UPDATE ON public.prd_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_prepaid_credits_updated_at ON public.prepaid_credits;
CREATE TRIGGER set_prepaid_credits_updated_at
  BEFORE UPDATE ON public.prepaid_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- 5. STATS VIEW (untuk dashboard)
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  p.id AS user_id,
  COUNT(DISTINCT pd.id) FILTER (WHERE pd.status = 'active') AS total_prd,
  COUNT(DISTINCT py.id) FILTER (WHERE py.status = 'PAID') AS total_paid,
  COALESCE(SUM(py.amount) FILTER (WHERE py.status = 'PAID'), 0) AS total_spent
FROM public.profiles p
LEFT JOIN public.prd_documents pd ON pd.user_id = p.id
LEFT JOIN public.payments py ON py.user_id = p.id
GROUP BY p.id;


-- 6. Hapus policy lama yang terlalu luas pada database yang sudah ada.
-- service_role Supabase selalu melewati RLS, jadi policy dengan USING (true)
-- tidak diperlukan dan berisiko memberi akses penuh ke client anonim.
DROP POLICY IF EXISTS "Service role dapat akses semua" ON public.prd_documents;
DROP POLICY IF EXISTS "Service role dapat akses semua payments" ON public.payments;
-- Dokumen dan pembayaran baru dibuat hanya melalui API server; policy INSERT
-- yang longgar would allow a browser client to forge rows outside those flows.
DROP POLICY IF EXISTS "User dapat membuat PRD" ON public.prd_documents;
DROP POLICY IF EXISTS "System dapat membuat pembayaran" ON public.payments;


-- ============================================================
-- CONTOH QUERY
-- ============================================================

-- Melihat semua PRD milik user:
-- SELECT * FROM public.prd_documents WHERE user_id = 'USER_UUID' ORDER BY created_at DESC;

-- Cek status pembayaran:
-- SELECT * FROM public.payments WHERE external_id = 'PRDIFY-pro-1234567890';

-- Total pendapatan:
-- SELECT SUM(amount) FROM public.payments WHERE status = 'PAID';

-- Jumlah PRD per package:
-- SELECT package_type, COUNT(*) FROM public.prd_documents GROUP BY package_type;
