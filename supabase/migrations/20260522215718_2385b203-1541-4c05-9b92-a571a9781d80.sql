-- Table to store one-time SMS verification codes issued via 2Factor.in
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON public.otp_codes (phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes (expires_at);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- No client-side access at all; only the service role (edge functions) reads/writes.
-- (Intentionally no policies = deny-all for anon and authenticated users.)
