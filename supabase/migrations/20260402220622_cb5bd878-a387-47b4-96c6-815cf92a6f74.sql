
DROP VIEW IF EXISTS public.professionals_public;
CREATE VIEW public.professionals_public WITH (security_invoker = on) AS
  SELECT id, user_id, display_name, specialization, years_experience, consultation_fee,
         rating, total_reviews, service_id, available, bio, image_url, city, created_at, updated_at,
         verification_status,
         CASE WHEN auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') 
              THEN id_proof_url ELSE NULL END AS id_proof_url,
         CASE WHEN auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') 
              THEN passport_photo_url ELSE NULL END AS passport_photo_url,
         CASE WHEN auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') 
              THEN license_number ELSE NULL END AS license_number
  FROM public.professionals;
