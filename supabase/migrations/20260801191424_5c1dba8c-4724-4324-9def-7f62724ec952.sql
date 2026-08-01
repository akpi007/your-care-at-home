
-- ============ 1. PROVIDER DOCUMENTS / BACKGROUND CHECKS ============
CREATE TABLE public.professional_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  document_url text,
  status text NOT NULL DEFAULT 'pending',
  note text,
  expires_at date,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT professional_documents_status_check CHECK (status IN ('pending','approved','rejected')),
  CONSTRAINT professional_documents_type_check CHECK (doc_type IN ('licence','id_proof','references','police_clearance','qualification','other')),
  UNIQUE (professional_id, doc_type)
);

GRANT SELECT, INSERT, UPDATE ON public.professional_documents TO authenticated;
GRANT ALL ON public.professional_documents TO service_role;
ALTER TABLE public.professional_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers view own documents" ON public.professional_documents
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid())
);

CREATE POLICY "Providers insert own documents" ON public.professional_documents
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid())
);

CREATE POLICY "Providers update own pending documents" ON public.professional_documents
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE POLICY "Admins manage documents" ON public.professional_documents
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_professional_documents_updated_at
BEFORE UPDATE ON public.professional_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Providers may not self-approve their documents
CREATE OR REPLACE FUNCTION public.protect_document_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.status := OLD.status;
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.note := OLD.note;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_document_review_fields
BEFORE UPDATE ON public.professional_documents
FOR EACH ROW EXECUTE FUNCTION public.protect_document_review_fields();

CREATE INDEX idx_professional_documents_prof ON public.professional_documents(professional_id);
CREATE INDEX idx_professional_documents_status ON public.professional_documents(status);

-- Licence expiry + intro video on professionals
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS licence_expiry date,
  ADD COLUMN IF NOT EXISTS intro_video_url text;

-- ============ 2. SOS ALERTS ============
CREATE TABLE public.sos_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  raised_role text NOT NULL DEFAULT 'patient',
  latitude numeric,
  longitude numeric,
  note text,
  status text NOT NULL DEFAULT 'open',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sos_alerts_status_check CHECK (status IN ('open','acknowledged','resolved')),
  CONSTRAINT sos_alerts_role_check CHECK (raised_role IN ('patient','professional'))
);

GRANT SELECT, INSERT, UPDATE ON public.sos_alerts TO authenticated;
GRANT ALL ON public.sos_alerts TO service_role;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own or admin all alerts" ON public.sos_alerts
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users raise own alerts" ON public.sos_alerts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins update alerts" ON public.sos_alerts
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_sos_alerts_status ON public.sos_alerts(status, created_at DESC);

-- ============ 3. VISIT VERIFICATIONS ============
CREATE TABLE public.visit_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  phase text NOT NULL,
  photo_url text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visit_verifications_phase_check CHECK (phase IN ('start','finish')),
  UNIQUE (booking_id, phase)
);

GRANT SELECT, INSERT ON public.visit_verifications TO authenticated;
GRANT ALL ON public.visit_verifications TO service_role;
ALTER TABLE public.visit_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants view verifications" ON public.visit_verifications
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    LEFT JOIN public.professionals p ON p.id = b.professional_id
    WHERE b.id = booking_id AND (b.user_id = auth.uid() OR p.user_id = auth.uid())
  )
);

CREATE POLICY "Providers create verifications" ON public.visit_verifications
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.professionals p ON p.id = b.professional_id
    WHERE b.id = booking_id AND p.id = professional_id AND p.user_id = auth.uid()
  )
);

CREATE INDEX idx_visit_verifications_booking ON public.visit_verifications(booking_id);

-- ============ 4. REFERRALS ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate text;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      candidate := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 7));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = candidate);
    END LOOP;
    NEW.referral_code := candidate;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

UPDATE public.profiles
SET referral_code = upper(substr(replace(id::text, '-', ''), 1, 7))
WHERE referral_code IS NULL;

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referred_user_id)
);

GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals" ON public.referrals
FOR SELECT TO authenticated
USING (referrer_user_id = auth.uid() OR referred_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users record own referral" ON public.referrals
FOR INSERT TO authenticated
WITH CHECK (referred_user_id = auth.uid() AND referrer_user_id <> auth.uid());

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_user_id);

-- ============ 5. RECURRING BOOKINGS ============
CREATE TABLE public.recurring_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  patient_profile_id uuid NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id),
  frequency text NOT NULL,
  day_of_week integer NOT NULL,
  booking_time time NOT NULL,
  start_date date NOT NULL,
  end_date date,
  address text,
  latitude numeric,
  longitude numeric,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recurring_frequency_check CHECK (frequency IN ('weekly','biweekly','monthly')),
  CONSTRAINT recurring_dow_check CHECK (day_of_week BETWEEN 0 AND 6)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_bookings TO authenticated;
GRANT ALL ON public.recurring_bookings TO service_role;
ALTER TABLE public.recurring_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own recurring bookings" ON public.recurring_bookings
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers view their recurring bookings" ON public.recurring_bookings
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE TRIGGER update_recurring_bookings_updated_at
BEFORE UPDATE ON public.recurring_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_recurring_bookings_user ON public.recurring_bookings(user_id);

-- ============ 6. REVIEW REPLIES ============
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS provider_response text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

CREATE POLICY "Providers reply to their reviews" ON public.reviews
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.protect_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = OLD.professional_id AND p.user_id = auth.uid())
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.rating := OLD.rating;
    NEW.comment := OLD.comment;
    NEW.booking_id := OLD.booking_id;
    NEW.patient_id := OLD.patient_id;
    NEW.professional_id := OLD.professional_id;
    IF NEW.provider_response IS DISTINCT FROM OLD.provider_response THEN
      NEW.responded_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_review_fields
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.protect_review_fields();
