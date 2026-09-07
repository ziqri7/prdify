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
  amount INTEGER NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED')),
  xendit_invoice_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON public.payments(external_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User dapat melihat pembayaran sendiri"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System dapat membuat pembayaran"
  ON public.payments FOR INSERT
  WITH CHECK (true);


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


-- 6. RLS untuk tabel admin (opsional)
-- Hanya akses via service_role key
CREATE POLICY "Service role dapat akses semua"
  ON public.prd_documents FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role dapat akses semua payments"
  ON public.payments FOR ALL
  USING (true)
  WITH CHECK (true);


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
