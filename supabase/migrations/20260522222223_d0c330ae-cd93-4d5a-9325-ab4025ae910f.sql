ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS used boolean NOT NULL DEFAULT false;
ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
UPDATE public.otp_codes SET used = verified WHERE used = false AND verified = true;