
-- 1. Drop the overly permissive anon policy on professionals base table
DROP POLICY IF EXISTS "Anon can read professionals via view" ON public.professionals;

-- 2. Recreate professionals_public view WITHOUT security_invoker
-- so it runs as the view owner (bypasses RLS) and anon doesn't need base table access
DROP VIEW IF EXISTS public.professionals_public;
CREATE VIEW public.professionals_public AS
SELECT
  id, user_id, years_experience, consultation_fee, rating, total_reviews,
  service_id, available, created_at, updated_at,
  display_name, specialization, bio, image_url, city, verification_status
FROM public.professionals;

-- Grant anon and authenticated SELECT on the view
GRANT SELECT ON public.professionals_public TO anon;
GRANT SELECT ON public.professionals_public TO authenticated;
