-- ============================================
-- SETUP ADMIN USER
-- ============================================
-- Instructions:
-- 1. First, create a user account via Supabase Auth (Dashboard > Authentication > Users > Add User)
-- 2. Note the user's UUID (found in the users table)
-- 3. Replace 'USER_UUID_HERE' below with the actual UUID
-- 4. Run this SQL in Supabase SQL Editor
-- ============================================

-- Method 1: If user already exists and profile was auto-created
-- Replace 'user-email@example.com' with the actual admin email
UPDATE public.profiles
SET 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'user-email@example.com';

-- Verify the update
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE email = 'user-email@example.com';

-- Method 2: If you know the user UUID
-- Replace 'USER_UUID_HERE' with the actual UUID from auth.users
UPDATE public.profiles
SET 
    role = 'admin',
    updated_at = NOW()
WHERE id = 'USER_UUID_HERE'::uuid;

-- Method 3: Create admin profile manually (if profile doesn't exist)
-- Replace 'USER_UUID_HERE' and 'admin@example.com' with actual values
INSERT INTO public.profiles (id, email, role)
VALUES (
    'USER_UUID_HERE'::uuid,
    'admin@example.com',
    'admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    email = EXCLUDED.email,
    updated_at = NOW();

-- ============================================
-- LIST ALL ADMIN USERS
-- ============================================

-- View all admin users
SELECT 
    p.id,
    p.email,
    p.role,
    p.created_at,
    u.email as auth_email,
    u.created_at as user_created_at
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;

-- ============================================
-- REMOVE ADMIN ROLE (if needed)
-- ============================================

-- Replace 'user-email@example.com' with the email
UPDATE public.profiles
SET 
    role = 'user',
    updated_at = NOW()
WHERE email = 'user-email@example.com';
