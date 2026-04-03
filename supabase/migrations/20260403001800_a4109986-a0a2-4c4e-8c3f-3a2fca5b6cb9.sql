
-- Fix security definer views by recreating with security_invoker = true
DROP VIEW IF EXISTS public.professionals_public;

CREATE VIEW public.professionals_public
WITH (security_invoker = true) AS
SELECT
  id, user_id, display_name, specialization, bio, image_url,
  city, years_experience, consultation_fee, rating, total_reviews,
  service_id, available, verification_status, created_at, updated_at
FROM public.professionals;

DROP VIEW IF EXISTS public.reviews_public;

CREATE VIEW public.reviews_public
WITH (security_invoker = true) AS
SELECT
  id, booking_id, professional_id, rating, comment, created_at
FROM public.reviews;
