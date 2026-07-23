
-- 1) Professionals: block self-editing of admin-controlled fields via trigger
CREATE OR REPLACE FUNCTION public.protect_professional_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.verification_status := OLD.verification_status;
    NEW.rating := OLD.rating;
    NEW.total_reviews := OLD.total_reviews;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_professional_admin_fields_trg ON public.professionals;
CREATE TRIGGER protect_professional_admin_fields_trg
BEFORE UPDATE ON public.professionals
FOR EACH ROW EXECUTE FUNCTION public.protect_professional_admin_fields();

-- 2) Bookings: pin immutable fields on update
CREATE OR REPLACE FUNCTION public.protect_booking_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.user_id := OLD.user_id;
    NEW.service_id := OLD.service_id;
    NEW.professional_id := OLD.professional_id;
    NEW.patient_profile_id := OLD.patient_profile_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_booking_immutable_fields_trg ON public.bookings;
CREATE TRIGGER protect_booking_immutable_fields_trg
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.protect_booking_immutable_fields();

-- 3) Reviews: restrict base-table SELECT to participants; general reads must use reviews_public view
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;

CREATE POLICY "Participants can view own review rows"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id
  OR EXISTS (
    SELECT 1 FROM public.professionals p
    WHERE p.id = reviews.professional_id AND p.user_id = auth.uid()
  )
);

-- 4) Realtime: remove wildcard LIKE topic policy on messages (exact-match policy remains)
DROP POLICY IF EXISTS "Booking participants can subscribe to realtime" ON realtime.messages;

-- 5) Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_otp_codes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_professional_admin_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_booking_immutable_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
