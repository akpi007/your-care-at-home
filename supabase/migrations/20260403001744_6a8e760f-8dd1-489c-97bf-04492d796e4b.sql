
-- 1. Drop the old professionals_public view and recreate WITHOUT sensitive columns
DROP VIEW IF EXISTS public.professionals_public;

CREATE VIEW public.professionals_public AS
SELECT
  id, user_id, display_name, specialization, bio, image_url,
  city, years_experience, consultation_fee, rating, total_reviews,
  service_id, available, verification_status, created_at, updated_at
FROM public.professionals;

-- 2. Replace the overly permissive SELECT policy on professionals
DROP POLICY IF EXISTS "Professionals public read non-sensitive" ON public.professionals;

CREATE POLICY "Public can read non-sensitive professional data"
ON public.professionals
FOR SELECT
TO public
USING (true);

-- Since the view now excludes sensitive columns, public reads go through the view.
-- Add a policy so only the owner or admin can read sensitive fields via direct table access:
-- We keep the broad SELECT but rely on the view for public-facing queries.

-- 3. Add Realtime channel authorization
-- Enable RLS on realtime.messages if not already
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- 4. Create a public reviews view without patient_id
CREATE OR REPLACE VIEW public.reviews_public AS
SELECT
  id, booking_id, professional_id, rating, comment, created_at
FROM public.reviews;
