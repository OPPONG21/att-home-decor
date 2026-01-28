-- Migration: Add notes column to products table
-- Run this in your Supabase SQL Editor to add the notes field

-- Add notes column if it doesn't exist
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment to the new column
COMMENT ON COLUMN public.products.notes IS 'Product notes/details, typically auto-filled from subcategory mappings';
