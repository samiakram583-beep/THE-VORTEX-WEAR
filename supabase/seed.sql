-- ==============================================================================
-- VORTEX WEAR - Initial Production Seed Data
-- 5 Premium Shirts, 5 Tailored Pants, Coupons, Banners, and Category data
-- ==============================================================================

-- 1. Insert Initial Categories
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, sort_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Shirts', 'shirts', 'Structured overshirts, refined oxford twill, and modern breathable essentials tailored for everyday elegance.', '/src/assets/images/category_shirts_vortex_1790956364111.jpg', true, 1),
  ('c2000000-0000-0000-0000-000000000002', 'Pants', 'pants', 'Precision tailored trousers, tactical utility cargos, and relaxed pleated pants engineered with premium durable fabric.', '/src/assets/images/category_pants_vortex_1790956382275.jpg', true, 2)
ON CONFLICT (slug) DO UPDATE
SET description = EXCLUDED.description, image_url = EXCLUDED.image_url;

-- 2. Insert Coupons
INSERT INTO public.coupons (id, code, discount_type, discount_value, minimum_order_amount, usage_limit, is_active)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'WELCOME10', 'percentage', 10, 2000, 500, true),
  ('d2000000-0000-0000-0000-000000000002', 'VORTEX15', 'percentage', 15, 5000, 200, true),
  ('d3000000-0000-0000-0000-000000000003', 'FLAT500', 'fixed', 500, 3500, 100, true)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Banners
INSERT INTO public.banners (id, title, description, image_url, button_text, button_url, is_active, sort_order)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Define Your Style.', 'Modern menswear designed for your everyday confidence and effortless presence in Pakistan.', '/src/assets/images/hero_vortex_fashion_1790956344973.jpg', 'Explore Collection', '/shop', true, 1)
ON CONFLICT DO NOTHING;

-- 4. Insert Products (5 Shirts & 5 Pants)
-- Shirt 1: Vortex Onyx Structured Overshirt
INSERT INTO public.products (id, category_id, name, slug, description, base_price, sale_price, sku, is_active, is_featured, is_new_arrival, is_on_sale)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Vortex Onyx Structured Overshirt', 'vortex-onyx-structured-overshirt', 'Crafted from high-density Japanese cotton twill with custom matte black snaps. Features twin chest welt pockets, drop shoulders, and a structured silhouette suitable for both smart casual and high-end streetwear.', 5490.00, 4690.00, 'VOR-SHT-001', true, true, true, true),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Atelier Oxford Button-Down Shirt', 'atelier-oxford-button-down-shirt', 'Pure 100% Egyptian long-staple cotton tailored with a crisp button-down collar, mother-of-pearl buttons, and refined back box pleat. The quintessence of modern professionalism.', 4290.00, NULL, 'VOR-SHT-002', true, true, true, false),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Raw Linen Camp Collar Resort Shirt', 'raw-linen-camp-collar-shirt', 'Woven from airy breathable French flax linen with a relaxed Cuban camp collar and subtle side split hem. Engineered for optimal comfort during warmer weather while maintaining impeccable drape.', 4490.00, 3990.00, 'VOR-SHT-003', true, false, true, true),
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Monochrome Minimalist Poplin Shirt', 'monochrome-minimalist-poplin-shirt', 'High-thread-count washed poplin with concealed front placket, sharp point collar, and single-button rounded cuffs. Clean lines without chest pockets for an ultra-sleek appearance.', 3890.00, NULL, 'VOR-SHT-004', true, false, false, false),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Heavyweight Twill Utility Overshirt', 'heavyweight-twill-utility-overshirt', 'Double-weave heavy cotton twill designed for versatile layering. Reinforced elbow patches, dual patch flap pockets, and horn buttons. Robust, durable, and architecturally striking.', 5890.00, 4990.00, 'VOR-SHT-005', true, true, false, true),

  -- Pants 1: Vortex Tactical Utility Cargo Pants
  ('p2000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000002', 'Vortex Tactical Utility Cargo Pants', 'vortex-tactical-utility-cargo-pants', 'Engineered from durable ripstop cotton-stretch blend with articulated knees, clean low-profile magnetic cargo pockets, and adjustable tapered ankle cuffs. Balancing utility with modern tailored aesthetics.', 5290.00, 4490.00, 'VOR-PNT-001', true, true, true, true),
  ('p2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'Tailored Pleated Wool-Blend Trousers', 'tailored-pleated-wool-blend-trousers', 'Single forward pleat trousers cut with a relaxed thigh tapering down cleanly to a modern break. Hidden internal drawstring waistband alongside traditional belt loops for versatile styling.', 5690.00, NULL, 'VOR-PNT-002', true, true, true, false),
  ('p2000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000003', 'Everyday Slim Stretch Chino Pants', 'everyday-slim-stretch-chino-pants', 'Crafted from enzyme-washed combed cotton with 3% elastane for seamless mobility. Clean front slant pockets, welt rear pockets, and reinforced waistband stitching.', 4190.00, 3690.00, 'VOR-PNT-003', true, false, true, true),
  ('p2000000-0000-0000-0000-000000000004', 'c2000000-0000-0000-0000-000000000004', 'Relaxed Fit Linen Drawstring Pants', 'relaxed-fit-linen-drawstring-pants', 'Airy washed linen trousers with elasticated waist, cotton drawcord, and straight leg drape. Effortless comfort for leisure and vacation wear.', 4390.00, NULL, 'VOR-PNT-004', true, false, false, false),
  ('p2000000-0000-0000-0000-000000000005', 'c2000000-0000-0000-0000-000000000005', 'Architectural Wide-Leg Trousers', 'architectural-wide-leg-trousers', 'Substantial structured twill drape with high-rise waist, deep double pleats, and generous wide-leg cut. An assertive fashion statement that complements minimal footwear.', 5990.00, 5190.00, 'VOR-PNT-005', true, true, false, true)
ON CONFLICT (slug) DO UPDATE
SET base_price = EXCLUDED.base_price, sale_price = EXCLUDED.sale_price;
