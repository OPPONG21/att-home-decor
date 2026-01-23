-- ============================================
-- SAMPLE PRODUCTS DATA
-- ============================================
-- This file contains sample product data for testing
-- Remove or modify before production use
-- ============================================

-- Clear existing products (BE CAREFUL - this deletes all products!)
-- TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;

-- Insert sample bedspreads
INSERT INTO public.products (name, category, price, image_url, whatsapp_url, badge, description, is_published) VALUES
('Luxury Bedspread', 'bedspread', 350.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-luxury.webp', 'https://wa.me/233540460532', 'best', 'Premium quality bedspread with elegant design and soft fabric', true),
('Classic Bedspread', 'bedspread', 280.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-classic.webp', 'https://wa.me/233540460532', NULL, 'Traditional design perfect for any bedroom', true),
('Modern Bedspread', 'bedspread', 300.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-modern.webp', 'https://wa.me/233540460532', 'new', 'Contemporary style with modern patterns', true),
('Cozy Bedspread', 'bedspread', 290.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-cozy.webp', 'https://wa.me/233540460532', NULL, 'Extra soft and comfortable for a cozy bedroom', true),
('Heritage Bedspread', 'bedspread', 310.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-heritage.webp', 'https://wa.me/233540460532', NULL, 'Heritage-inspired design with rich colors', true),
('Opal Bedspread', 'bedspread', 320.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-opal.webp', 'https://wa.me/233540460532', NULL, 'Elegant opal-colored bedspread', true)
ON CONFLICT DO NOTHING;

-- Insert sample curtains
INSERT INTO public.products (name, category, price, image_url, whatsapp_url, badge, description, is_published) VALUES
('Modern Curtain Set', 'curtain', 200.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt1.webp', 'https://wa.me/233540460532', 'new', 'Modern design curtains perfect for living rooms', true),
('Elegant Curtains', 'curtain', 250.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt2.webp', 'https://wa.me/233540460532', NULL, 'Elegant and sophisticated window treatment', true),
('Classic Curtains', 'curtain', 220.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt3.webp', 'https://wa.me/233540460532', NULL, 'Classic style curtains for traditional homes', true),
('Premium Curtain Set', 'curtain', 280.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt4.webp', 'https://wa.me/233540460532', 'best', 'Premium quality curtains with blackout feature', true),
('Sheer Curtains', 'curtain', 180.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt5.webp', 'https://wa.me/233540460532', NULL, 'Light and airy sheer curtains for natural lighting', true),
('Velvet Curtains', 'curtain', 320.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt6.webp', 'https://wa.me/233540460532', NULL, 'Luxurious velvet curtains for elegant interiors', true)
ON CONFLICT DO NOTHING;

-- Verify inserted products
SELECT 
    id,
    name,
    category,
    price,
    badge,
    is_published,
    created_at
FROM public.products
ORDER BY category, created_at DESC;

-- Count products by category
SELECT 
    category,
    COUNT(*) as count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM public.products
WHERE is_published = true
GROUP BY category;
