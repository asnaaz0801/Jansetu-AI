-- Idempotent Supabase SQL migration script
-- Adds missing administrative location fields to the complaints/issues storage.
-- Verified: The active table in the database and React application is named 'issues'.
-- The 'issues' table already contains the 'state' column, but is missing 'district', 'city', 'area', and 'pincode'.

-- 1. Add missing columns to the existing 'issues' table
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS area text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS pincode text;

-- 2. Optional / Alternative: Add columns to a 'complaints' table if it is created/renamed in the future
-- ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS state text;
-- ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS district text;
-- ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS city text;
-- ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS area text;
-- ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS pincode text;
