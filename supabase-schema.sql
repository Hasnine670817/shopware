-- ============================================================
-- SHOPWARE - Supabase SQL Schema (Supabase Auth Version)
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. USERS TABLE (no password — Supabase Auth handles it)
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user',
  blocked     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id               TEXT PRIMARY KEY,
  brand            TEXT,
  title            TEXT NOT NULL,
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  image            TEXT,
  badge_type       TEXT,
  category         TEXT,
  collection       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id      TEXT UNIQUE NOT NULL,
  user_email    TEXT NOT NULL,
  items         JSONB NOT NULL DEFAULT '[]',
  subtotal      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending',
  customer_info JSONB,
  payment_info  JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: Auto-create public.users row on Supabase Auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role, blocked, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'user',
    false,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- GRANT permissions to anon and authenticated roles
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users    TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders   TO anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_users"    ON public.users;
DROP POLICY IF EXISTS "allow_all_products" ON public.products;
DROP POLICY IF EXISTS "allow_all_orders"   ON public.orders;

CREATE POLICY "allow_all_users"    ON public.users    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_orders"   ON public.orders   FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- ADMIN USER SETUP (run after creating admin via Auth Dashboard)
-- Step 1: Go to Supabase → Authentication → Users → Add user
--         Email: admin@shopware.com | Password: Admin@12345
-- Step 2: Run this query to promote to admin:
--         UPDATE public.users SET role = 'admin' WHERE email = 'admin@shopware.com';
-- ============================================================
