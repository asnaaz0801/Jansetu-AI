-- Supabase SQL migration script
-- Adds image_url column to the issues table to store uploaded complaint images.

ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS image_url text;
