
-- 1. Drop the anon SELECT policy on reviews
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;

-- 2. Recreate reviews_public view as security definer (excludes patient_id)
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public AS
SELECT
  id, booking_id, professional_id, rating, created_at, comment
FROM public.reviews;

GRANT SELECT ON public.reviews_public TO anon;
GRANT SELECT ON public.reviews_public TO authenticated;
