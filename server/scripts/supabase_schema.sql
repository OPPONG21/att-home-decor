-- ============================================
-- AT&T Home Decor - Supabase Database Schema
-- ============================================
-- This file contains the complete database schema for the AT&T Home Decor project
-- Run these SQL commands in your Supabase SQL Editor in order
-- ============================================

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('bedspread', 'curtain', 'all', 'pillows')),
        category TEXT NOT NULL CHECK (category IN ('bedspread', 'curtain', 'all', 'pillows', 'blankets')),
    subcategory TEXT,
    price DECIMAL(10, 2),
    image_url TEXT,
    image_path TEXT, -- Alternative field for storage path
    whatsapp_url TEXT DEFAULT 'https://wa.me/233540460532',
    badge TEXT, -- e.g., 'best', 'new', null
    description TEXT, -- Optional product description
    is_published BOOLEAN DEFAULT true, -- Allow hiding products without deleting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public.products IS 'Product catalog for bedspreads and curtains';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);

-- ============================================
-- 2. PROFILES TABLE (for admin authentication)
-- ============================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products: Allow anyone to read published products
CREATE POLICY "Public can view published products"
    ON public.products
    FOR SELECT
    USING (is_published = true);

-- Products: Only admins can insert (handled by service role in code)
-- Products: Only admins can update (handled by service role in code)
-- Products: Only admins can delete (handled by service role in code)

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Profiles: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        -- Prevent users from changing their own role
        (OLD.role = NEW.role)
    );

-- Profiles: Service role can read all profiles (for admin checks)
-- This is handled by using supabaseAdmin in code, which bypasses RLS

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products updated_at
DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        'user' -- Default role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. STORAGE BUCKET SETUP
-- ============================================
-- Note: Storage buckets must be created via Supabase Dashboard or Storage API
-- Run these commands in Supabase SQL Editor or via Dashboard:

-- Create product-images bucket (run this in Supabase Dashboard > Storage)
-- Bucket name: product-images
-- Public bucket: Yes (or use signed URLs if you want private)

-- Storage policies (if bucket is public, these may not be needed)
-- If bucket is private, add these policies:

-- Allow public read access to product images
-- CREATE POLICY "Public can view product images"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'product-images');

-- Allow authenticated admins to upload images
-- CREATE POLICY "Admins can upload product images"
--     ON storage.objects FOR INSERT
--     WITH CHECK (
--         bucket_id = 'product-images' AND
--         auth.role() = 'authenticated' AND
--         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
--     );

-- Allow authenticated admins to delete images
-- CREATE POLICY "Admins can delete product images"
--     ON storage.objects FOR DELETE
--     USING (
--         bucket_id = 'product-images' AND
--         auth.role() = 'authenticated' AND
--         (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
--     );

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Grant access to anon users (for public product viewing)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.products TO anon;

-- ============================================
-- 7. SAMPLE DATA (Optional - Remove in production)
-- ============================================

-- Uncomment below to insert sample products (for testing only)

-- INSERT INTO public.products (name, category, price, image_url, whatsapp_url, badge) VALUES
-- ('Luxury Bedspread', 'bedspread', 350.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-luxury.webp', 'https://wa.me/233540460532', 'best'),
-- ('Modern Curtain Set', 'curtain', 200.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt1.webp', 'https://wa.me/233540460532', 'new'),
-- ('Classic Bedspread', 'bedspread', 280.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-classic.webp', 'https://wa.me/233540460532', NULL),
-- ('Elegant Curtains', 'curtain', 250.00, 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt2.webp', 'https://wa.me/233540460532', NULL)
-- ON CONFLICT DO NOTHING;

-- ============================================
-- END OF SCHEMA
-- ============================================
