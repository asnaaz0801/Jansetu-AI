-- SQL Migration: Add email_id column and setup automated defaults/triggers for issues table

-- 1. Add email_id column to issues table if it does not exist
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS email_id text;

-- 2. Ensure issue_id has a default value (UUID)
ALTER TABLE public.issues ALTER COLUMN issue_id SET DEFAULT gen_random_uuid();

-- 3. Ensure created_at has a default value (timestamp)
ALTER TABLE public.issues ALTER COLUMN created_at SET DEFAULT NOW();

-- 4. Create sequence for reference_code
CREATE SEQUENCE IF NOT EXISTS public.reference_code_seq;

-- 5. Align the sequence with the highest existing numeric suffix of the reference_code
SELECT setval('public.reference_code_seq', 
  COALESCE(
    (SELECT MAX(NULLIF(regexp_replace(reference_code, '\D', '', 'g'), '')::integer) 
     FROM public.issues 
     WHERE reference_code LIKE 'JSA-2026-%'), 
    0
  ) + 1, 
  false
);

-- 6. Trigger function to automatically assign reference_code
CREATE OR REPLACE FUNCTION public.issues_reference_code_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- If reference_code is null, empty, or matches the client-generated random 4-digit format, override it with sequential value
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' OR NEW.reference_code ~ '^JSA-2026-\d{4}$' THEN
    NEW.reference_code := 'JSA-2026-' || lpad(nextval('public.reference_code_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Bind trigger to issues table
DROP TRIGGER IF EXISTS tr_issues_reference_code ON public.issues;
CREATE TRIGGER tr_issues_reference_code
BEFORE INSERT ON public.issues
FOR EACH ROW
EXECUTE FUNCTION public.issues_reference_code_trigger();
