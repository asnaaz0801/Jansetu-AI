-- SQL Migration: Fix reference_code sequence alignment and trigger function
-- This corrects the regex/substring extraction to get only the numeric suffix after the prefix 'JSA-2026-'

-- 1. Correct sequence alignment
SELECT setval('public.reference_code_seq', 
  COALESCE(
    (SELECT MAX(NULLIF(SUBSTRING(reference_code FROM 10), '')::integer) 
     FROM public.issues 
     WHERE reference_code LIKE 'JSA-2026-%' 
       AND SUBSTRING(reference_code FROM 10) ~ '^[0-9]+$'
       AND NULLIF(SUBSTRING(reference_code FROM 10), '')::integer < 10000), -- exclude large/year numbers like 2026
    0
  ) + 1, 
  false
);

-- 2. Update trigger function to handle sequence values properly
CREATE OR REPLACE FUNCTION public.issues_reference_code_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- If reference_code is null, empty, or matches the client-generated formats, assign next sequential value
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' OR NEW.reference_code ~ '^JSA-2026-\d{4}$' THEN
    NEW.reference_code := 'JSA-2026-' || lpad(nextval('public.reference_code_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
