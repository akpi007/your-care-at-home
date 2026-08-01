-- ============================================================
-- 1. DISPUTES
-- ============================================================
CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  raised_by uuid NOT NULL,
  professional_id uuid REFERENCES public.professionals(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'other',
  description text NOT NULL,
  evidence_url text,
  status text NOT NULL DEFAULT 'open',
  resolution_note text,
  refund_amount numeric DEFAULT 0,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT disputes_category_chk CHECK (category IN ('no_show','service_not_delivered','billing','conduct','quality','other')),
  CONSTRAINT disputes_status_chk CHECK (status IN ('open','under_review','resolved','rejected'))
);

GRANT SELECT, INSERT, UPDATE ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can raise disputes on their bookings"
ON public.disputes FOR INSERT TO authenticated
WITH CHECK (
  raised_by = auth.uid()
  AND EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
);

CREATE POLICY "Patients view own disputes"
ON public.disputes FOR SELECT TO authenticated
USING (raised_by = auth.uid());

CREATE POLICY "Professionals view disputes against them"
ON public.disputes FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE POLICY "Admins view all disputes"
ON public.disputes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage disputes"
ON public.disputes FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER disputes_updated_at BEFORE UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_disputes_status ON public.disputes(status, created_at DESC);
CREATE INDEX idx_disputes_booking ON public.disputes(booking_id);
CREATE INDEX idx_disputes_raised_by ON public.disputes(raised_by);
CREATE INDEX idx_disputes_professional ON public.disputes(professional_id);

-- Auto-fill professional_id from the booking
CREATE OR REPLACE FUNCTION public.set_dispute_professional()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.professional_id IS NULL THEN
    SELECT professional_id INTO NEW.professional_id FROM public.bookings WHERE id = NEW.booking_id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.set_dispute_professional() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER disputes_set_professional BEFORE INSERT ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.set_dispute_professional();

-- Only admins may change resolution fields
CREATE OR REPLACE FUNCTION public.protect_dispute_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.status := OLD.status;
    NEW.resolution_note := OLD.resolution_note;
    NEW.refund_amount := OLD.refund_amount;
    NEW.resolved_by := OLD.resolved_by;
    NEW.resolved_at := OLD.resolved_at;
    NEW.booking_id := OLD.booking_id;
    NEW.raised_by := OLD.raised_by;
    NEW.professional_id := OLD.professional_id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.protect_dispute_fields() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER disputes_protect_fields BEFORE UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.protect_dispute_fields();

-- ============================================================
-- 2. USER REPORTS
-- ============================================================
CREATE TABLE public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.user_reports TO authenticated;
GRANT UPDATE ON public.user_reports TO authenticated;
GRANT ALL ON public.user_reports TO service_role;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can file reports"
ON public.user_reports FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid() AND reported_user_id <> auth.uid());

CREATE POLICY "Reporters view own reports"
ON public.user_reports FOR SELECT TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY "Admins view all reports"
ON public.user_reports FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update reports"
ON public.user_reports FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_user_reports_status ON public.user_reports(status, created_at DESC);
CREATE INDEX idx_user_reports_reported ON public.user_reports(reported_user_id);

-- ============================================================
-- 3. USER BLOCKS
-- ============================================================
CREATE TABLE public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_user_id)
);

GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;
GRANT ALL ON public.user_blocks TO service_role;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own blocks"
ON public.user_blocks FOR ALL TO authenticated
USING (blocker_id = auth.uid())
WITH CHECK (blocker_id = auth.uid() AND blocked_user_id <> auth.uid());

CREATE INDEX idx_user_blocks_blocker ON public.user_blocks(blocker_id);

-- ============================================================
-- 4. PAYOUT REQUESTS
-- ============================================================
CREATE TABLE public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'requested',
  method text,
  destination text,
  admin_note text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payout_status_chk CHECK (status IN ('requested','approved','paid','rejected'))
);

GRANT SELECT, INSERT, UPDATE ON public.payout_requests TO authenticated;
GRANT ALL ON public.payout_requests TO service_role;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals request payouts"
ON public.payout_requests FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE POLICY "Professionals view own payouts"
ON public.payout_requests FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.user_id = auth.uid()));

CREATE POLICY "Admins view all payouts"
ON public.payout_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update payouts"
ON public.payout_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER payout_requests_updated_at BEFORE UPDATE ON public.payout_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_payout_requests_status ON public.payout_requests(status, created_at DESC);
CREATE INDEX idx_payout_requests_prof ON public.payout_requests(professional_id);

-- ============================================================
-- 5. FAVOURITES
-- ============================================================
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, professional_id)
);

GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own favorites"
ON public.favorites FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- ============================================================
-- 6. NOTIFICATIONS (in-app)
-- ============================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'general',
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users mark own notifications read"
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- 7. ERROR LOGS
-- ============================================================
CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  stack text,
  source text,
  url text,
  user_agent text,
  severity text NOT NULL DEFAULT 'error',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.error_logs TO authenticated, anon;
GRANT SELECT ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report an error"
ON public.error_logs FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Admins read error logs"
ON public.error_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_error_logs_created ON public.error_logs(created_at DESC);

-- ============================================================
-- 8. CANCELLATION POLICY ON BOOKINGS
-- ============================================================
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS is_late_cancellation boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancellation_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS no_show_by text;

CREATE OR REPLACE FUNCTION public.enforce_cancellation_policy()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_start timestamptz;
  v_hours numeric;
  v_fee_base numeric;
  v_is_admin boolean;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
    v_is_admin := public.has_role(auth.uid(), 'admin');

    IF NOT v_is_admin AND OLD.status IN ('completed') THEN
      RAISE EXCEPTION 'A completed booking cannot be cancelled. Please raise a dispute instead.';
    END IF;

    IF NOT v_is_admin AND OLD.status IN ('on_the_way','arrived') THEN
      RAISE EXCEPTION 'The professional is already en route. Please contact support or raise a dispute.';
    END IF;

    v_start := (NEW.booking_date::timestamptz + NEW.booking_time);
    v_hours := EXTRACT(EPOCH FROM (v_start - now())) / 3600.0;

    NEW.cancelled_at := now();
    NEW.cancelled_by := COALESCE(NEW.cancelled_by, auth.uid());

    IF v_hours < 12 AND NOT v_is_admin THEN
      NEW.is_late_cancellation := true;
      SELECT COALESCE(p.consultation_fee, 0) INTO v_fee_base
      FROM public.professionals p WHERE p.id = NEW.professional_id;
      NEW.cancellation_fee := ROUND(COALESCE(v_fee_base, 0) * 0.25, 2);
    ELSE
      NEW.is_late_cancellation := false;
      NEW.cancellation_fee := 0;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.enforce_cancellation_policy() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS bookings_cancellation_policy ON public.bookings;
CREATE TRIGGER bookings_cancellation_policy BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_cancellation_policy();

-- Re-attach previously defined protective triggers (they were missing)
DROP TRIGGER IF EXISTS bookings_protect_immutable ON public.bookings;
CREATE TRIGGER bookings_protect_immutable BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.protect_booking_immutable_fields();

DROP TRIGGER IF EXISTS bookings_enforce_verified_professional ON public.bookings;
CREATE TRIGGER bookings_enforce_verified_professional BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_verified_professional();

DROP TRIGGER IF EXISTS professionals_protect_admin_fields ON public.professionals;
CREATE TRIGGER professionals_protect_admin_fields BEFORE UPDATE ON public.professionals
FOR EACH ROW EXECUTE FUNCTION public.protect_professional_admin_fields();

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS professionals_updated_at ON public.professionals;
CREATE TRIGGER professionals_updated_at BEFORE UPDATE ON public.professionals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS patient_profiles_updated_at ON public.patient_profiles;
CREATE TRIGGER patient_profiles_updated_at BEFORE UPDATE ON public.patient_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 9. REVIEW INTEGRITY
-- ============================================================
DELETE FROM public.reviews a USING public.reviews b
WHERE a.ctid < b.ctid AND a.booking_id = b.booking_id;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_reviews_booking ON public.reviews(booking_id);

CREATE OR REPLACE FUNCTION public.enforce_review_eligibility()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  b RECORD;
BEGIN
  SELECT * INTO b FROM public.bookings WHERE id = NEW.booking_id;
  IF b IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  IF b.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'You can only review your own bookings';
  END IF;
  IF b.status <> 'completed' THEN
    RAISE EXCEPTION 'You can only review a completed booking';
  END IF;
  NEW.patient_id := auth.uid();
  NEW.professional_id := b.professional_id;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.enforce_review_eligibility() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reviews_enforce_eligibility ON public.reviews;
CREATE TRIGGER reviews_enforce_eligibility BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.enforce_review_eligibility();

CREATE OR REPLACE FUNCTION public.refresh_professional_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_prof uuid := COALESCE(NEW.professional_id, OLD.professional_id);
BEGIN
  UPDATE public.professionals p
  SET rating = COALESCE(sub.avg_rating, 0),
      total_reviews = COALESCE(sub.cnt, 0)
  FROM (
    SELECT ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS cnt
    FROM public.reviews WHERE professional_id = v_prof
  ) sub
  WHERE p.id = v_prof;
  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.refresh_professional_rating() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reviews_refresh_rating ON public.reviews;
CREATE TRIGGER reviews_refresh_rating AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_professional_rating();

-- ============================================================
-- 10. NOTIFICATION FAN-OUT ON BOOKING STATUS CHANGE
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_prof_user uuid;
  v_title text;
  v_body text;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NULL;
  END IF;

  SELECT user_id INTO v_prof_user FROM public.professionals WHERE id = NEW.professional_id;

  v_title := CASE NEW.status
    WHEN 'confirmed' THEN 'Booking confirmed'
    WHEN 'assigned' THEN 'Professional assigned'
    WHEN 'on_the_way' THEN 'Your professional is on the way'
    WHEN 'arrived' THEN 'Your professional has arrived'
    WHEN 'completed' THEN 'Visit completed'
    WHEN 'cancelled' THEN 'Booking cancelled'
    ELSE 'Booking updated'
  END;

  v_body := 'Appointment on ' || NEW.booking_date::text || ' at ' || NEW.booking_time::text || '.';

  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (NEW.user_id, v_title, v_body, 'booking', '/dashboard');

  IF v_prof_user IS NOT NULL AND v_prof_user <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (v_prof_user, v_title, v_body, 'booking', '/provider-dashboard');
  END IF;

  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_booking_status_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS bookings_notify_status ON public.bookings;
CREATE TRIGGER bookings_notify_status AFTER UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_booking_status_change();

-- Notify the professional when a dispute is filed against them
CREATE OR REPLACE FUNCTION public.notify_dispute_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_prof_user uuid;
BEGIN
  SELECT user_id INTO v_prof_user FROM public.professionals WHERE id = NEW.professional_id;
  IF v_prof_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (v_prof_user, 'A dispute was opened', 'A patient reported an issue with one of your bookings.', 'dispute', '/provider-dashboard');
  END IF;
  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_dispute_created() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS disputes_notify_created ON public.disputes;
CREATE TRIGGER disputes_notify_created AFTER INSERT ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.notify_dispute_created();

-- Notify the patient when a dispute is resolved
CREATE OR REPLACE FUNCTION public.notify_dispute_resolved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('resolved','rejected') AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (
      NEW.raised_by,
      CASE WHEN NEW.status = 'resolved' THEN 'Your dispute was resolved' ELSE 'Your dispute was closed' END,
      COALESCE(NEW.resolution_note, 'An administrator reviewed your case.'),
      'dispute',
      '/dashboard'
    );
  END IF;
  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_dispute_resolved() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS disputes_notify_resolved ON public.disputes;
CREATE TRIGGER disputes_notify_resolved AFTER UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.notify_dispute_resolved();

-- Notify the professional when a payout is processed
CREATE OR REPLACE FUNCTION public.notify_payout_processed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT user_id INTO v_user FROM public.professionals WHERE id = NEW.professional_id;
    IF v_user IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, type, link)
      VALUES (v_user, 'Payout ' || NEW.status, 'Your payout request of ' || NEW.amount::text || ' is now ' || NEW.status || '.', 'payout', '/provider-earnings');
    END IF;
  END IF;
  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_payout_processed() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS payouts_notify_processed ON public.payout_requests;
CREATE TRIGGER payouts_notify_processed AFTER UPDATE ON public.payout_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_payout_processed();
