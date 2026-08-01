-- Keep OTP rows for 24h so rate limiting can count them, then purge
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  DELETE FROM public.otp_codes
  WHERE created_at < now() - interval '24 hours';
$function$;

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_otp_codes() FROM PUBLIC, anon, authenticated;

-- Only verified professionals can receive bookings
CREATE OR REPLACE FUNCTION public.enforce_verified_professional()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_status text;
BEGIN
  SELECT verification_status INTO v_status
  FROM public.professionals
  WHERE id = NEW.professional_id;

  IF v_status IS DISTINCT FROM 'verified' THEN
    RAISE EXCEPTION 'This professional is not verified and cannot accept bookings';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.enforce_verified_professional() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_verified_professional_trg ON public.bookings;
CREATE TRIGGER enforce_verified_professional_trg
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_verified_professional();