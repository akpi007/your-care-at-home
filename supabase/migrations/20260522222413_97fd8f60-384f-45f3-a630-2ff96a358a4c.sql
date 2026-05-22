CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.otp_codes
  WHERE expires_at < now() - interval '1 day'
     OR used = true;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_otp_codes() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-otp-codes') THEN
    PERFORM cron.unschedule('cleanup-expired-otp-codes');
  END IF;
END $$;

SELECT cron.schedule(
  'cleanup-expired-otp-codes',
  '0 * * * *',
  $$ SELECT public.cleanup_expired_otp_codes(); $$
);