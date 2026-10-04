-- ==============================================================================
-- VORTEX WEAR - Row Level Security (RLS) Policies
-- Strict Access Control & Role Enforcement for Customer Privacy & Admin Security
-- ==============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 0. HELPER FUNCTION: is_admin()
-- Checks that:
-- 1. The user is authenticated (auth.uid() IS NOT NULL)
-- 2. User has role = 'admin' in profiles
-- 3. User email exists and is active in authorized_admins allowlist
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.authorized_admins a ON LOWER(p.email) = LOWER(a.email)
    WHERE p.id = auth.uid() 
      AND p.role = 'admin'
      AND a.is_active = true
  );
$$;

-- ==============================================================================
-- 1. AUTHORIZED ADMINS TABLE POLICIES
-- Only verified administrators can view the allowlist; no public access
-- ==============================================================================
CREATE POLICY "Admins can view admin allowlist"
  ON public.authorized_admins FOR SELECT
  USING (public.is_admin());

-- ==============================================================================
-- 2. ADMIN AUDIT LOGS POLICIES
-- Strictly protected; only verified admins can view or insert audit logs
-- ==============================================================================
CREATE POLICY "Admins view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 3. PROFILES POLICIES
-- Customer Privacy: Users can only see and update their own profile.
-- Self-role escalation is strictly prevented by WITH CHECK.
-- ==============================================================================
CREATE POLICY "Users view own profile or admin view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users update own profile without role escalation"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      role = (SELECT role FROM public.profiles WHERE id = auth.uid())
      OR public.is_admin()
    )
  );

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ==============================================================================
-- 4. CATEGORIES POLICIES
-- Public can browse active categories; only admins can create, edit, or delete
-- ==============================================================================
CREATE POLICY "Public view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- 5. PRODUCTS POLICIES
-- Public can browse active products; only admins can create, edit, delete, or price
-- ==============================================================================
CREATE POLICY "Public view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- 6. PRODUCT IMAGES & VARIANTS
-- Public can view images and active variants; only admins can modify or change stock
-- ==============================================================================
CREATE POLICY "Public view product images"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public view active variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage product variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- 7. ORDERS & CUSTOMER PRIVACY POLICIES
-- Customers can ONLY view their own orders (auth.uid() = user_id).
-- Accessing another customer's order is strictly blocked.
-- ==============================================================================
CREATE POLICY "Users view own orders or admin view all"
  ON public.orders FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR public.is_admin()
  );

CREATE POLICY "Customers place orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "Admins update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ==============================================================================
-- 8. ORDER ITEMS POLICIES
-- Strictly scoped to the parent order's user_id or admin
-- ==============================================================================
CREATE POLICY "Users view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND ((auth.uid() IS NOT NULL AND orders.user_id = auth.uid()) OR public.is_admin())
    )
  );

CREATE POLICY "Allow order item creation on purchase"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- 9. WISHLISTS POLICIES
-- Users manage only their own wishlist
-- ==============================================================================
CREATE POLICY "Users manage own wishlist"
  ON public.wishlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 10. REVIEWS POLICIES
-- Public reads approved reviews; users can submit reviews for moderation
-- ==============================================================================
CREATE POLICY "Public read approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_admin());

CREATE POLICY "Authenticated users submit reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_approved = false);

CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- 11. COUPONS POLICIES
-- Public reads active coupons; admins create, update, delete coupons
-- ==============================================================================
CREATE POLICY "Public read active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- 12. ADDRESSES POLICIES
-- Customer Privacy: Users can only view and manage their own delivery addresses
-- ==============================================================================
CREATE POLICY "Users manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 13. BANNERS & SITE SETTINGS POLICIES
-- Public can read; only admins can modify
-- ==============================================================================
CREATE POLICY "Public read active banners"
  ON public.banners FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage banners"
  ON public.banners FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());
