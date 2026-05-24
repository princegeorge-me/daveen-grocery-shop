-- ============================================================
-- Daveen African Food & Grocery — Supabase RLS Policies
-- Run this in the Supabase SQL editor after migrations
-- ============================================================

-- Enable RLS on all customer-facing tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Public read access (no RLS needed — handled via API)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- ── Helper function ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS TEXT AS $$
  SELECT id FROM public.users WHERE supabase_id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('ADMIN', 'SUPER_ADMIN')
  FROM public.users
  WHERE supabase_id = auth.uid()::text
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── Products (public read, admin write) ───────────────────────────────────
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL USING (public.is_admin());

-- ── Categories (public read) ───────────────────────────────────────────────
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL USING (public.is_admin());

-- ── Delivery Zones (public read) ──────────────────────────────────────────
CREATE POLICY "Delivery zones are public"
  ON public.delivery_zones FOR SELECT USING (true);

CREATE POLICY "Admins can manage delivery zones"
  ON public.delivery_zones FOR ALL USING (public.is_admin());

-- ── Users (own record only) ────────────────────────────────────────────────
CREATE POLICY "Users can view their own record"
  ON public.users FOR SELECT
  USING (supabase_id = auth.uid()::text);

CREATE POLICY "Users can update their own record"
  ON public.users FOR UPDATE
  USING (supabase_id = auth.uid()::text)
  WITH CHECK (supabase_id = auth.uid()::text);

CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL USING (public.is_admin());

-- ── Addresses (own addresses only) ────────────────────────────────────────
CREATE POLICY "Users can manage their own addresses"
  ON public.addresses FOR ALL
  USING (user_id = public.get_user_id());

CREATE POLICY "Admins can view all addresses"
  ON public.addresses FOR SELECT USING (public.is_admin());

-- ── Orders (own orders only) ───────────────────────────────────────────────
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (user_id = public.get_user_id());

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL USING (public.is_admin());

-- ── Order Items ────────────────────────────────────────────────────────────
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = public.get_user_id()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT USING (public.is_admin());

-- ── Payments ───────────────────────────────────────────────────────────────
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = public.get_user_id()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT USING (public.is_admin());

-- ── Wishlist ───────────────────────────────────────────────────────────────
CREATE POLICY "Users can manage their own wishlist"
  ON public.wishlist_items FOR ALL
  USING (user_id = public.get_user_id());

-- ── Reviews ────────────────────────────────────────────────────────────────
CREATE POLICY "Approved reviews are public"
  ON public.reviews FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own reviews"
  ON public.reviews FOR SELECT
  USING (user_id = public.get_user_id());

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (user_id = public.get_user_id());

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (user_id = public.get_user_id());

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL USING (public.is_admin());

-- ── Loyalty Transactions ───────────────────────────────────────────────────
CREATE POLICY "Users can view their own loyalty transactions"
  ON public.loyalty_transactions FOR SELECT
  USING (user_id = public.get_user_id());

CREATE POLICY "Admins can manage loyalty transactions"
  ON public.loyalty_transactions FOR ALL USING (public.is_admin());

-- ── Coupons (public read for active ones) ─────────────────────────────────
CREATE POLICY "Active coupons are readable"
  ON public.coupons FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL USING (public.is_admin());

-- ── Promotions (public read for active) ───────────────────────────────────
CREATE POLICY "Active promotions are public"
  ON public.promotions FOR SELECT
  USING (is_active = true AND starts_at <= NOW() AND ends_at > NOW());

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL USING (public.is_admin());

-- ── Enable Realtime on orders table (for live order tracking) ─────────────
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.orders;
COMMIT;

SELECT 'RLS policies applied successfully' AS status;
