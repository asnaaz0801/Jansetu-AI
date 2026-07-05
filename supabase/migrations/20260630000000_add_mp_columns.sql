-- Supabase SQL migration script
-- Safely adds MP-specific management columns to the public.issues table if they do not already exist.

ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS mp_comment text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS assigned_mp text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS ai_analysis jsonb;
