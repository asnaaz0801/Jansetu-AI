-- Supabase SQL migration script
-- Adds status column to public.mp_notices table to store selected complaint status.

ALTER TABLE public.mp_notices ADD COLUMN IF NOT EXISTS status text;

-- Disable RLS on issues, mp_notices, and status_history tables to allow direct updates, inserts, and trigger operations
ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history DISABLE ROW LEVEL SECURITY;
