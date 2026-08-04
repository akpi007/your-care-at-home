
-- 1. Move has_role definer body into a non-exposed schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.has_role(_user_id, _role)
$$;

-- 2. Force safe defaults on booking INSERT
CREATE OR REPLACE FUNCTION public.protect_booking_insert_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.status := 'pending';
    NEW.cancelled_at := NULL;
    NEW.cancelled_by := NULL;
    NEW.cancellation_reason := NULL;
    NEW.is_late_cancellation := false;
    NEW.cancellation_fee := 0;
    NEW.no_show_by := NULL;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_booking_insert_fields() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS bookings_protect_insert ON public.bookings;
CREATE TRIGGER bookings_protect_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.protect_booking_insert_fields();

-- 3. Force safe defaults on dispute INSERT
CREATE OR REPLACE FUNCTION public.protect_dispute_insert_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.status := 'open';
    NEW.resolution_note := NULL;
    NEW.refund_amount := 0;
    NEW.resolved_by := NULL;
    NEW.resolved_at := NULL;
    NEW.raised_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_dispute_insert_fields() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS disputes_protect_insert ON public.disputes;
CREATE TRIGGER disputes_protect_insert
  BEFORE INSERT ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.protect_dispute_insert_fields();

-- 4. Force safe defaults on payout request INSERT
CREATE OR REPLACE FUNCTION public.protect_payout_insert_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.status := 'requested';
    NEW.admin_note := NULL;
    NEW.processed_by := NULL;
    NEW.processed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_payout_insert_fields() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS payouts_protect_insert ON public.payout_requests;
CREATE TRIGGER payouts_protect_insert
  BEFORE INSERT ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_payout_insert_fields();

-- 5. Professionals self-update: explicit WITH CHECK + single authoritative trigger
DROP POLICY IF EXISTS "Professionals can update own record" ON public.professionals;
CREATE POLICY "Professionals can update own record"
  ON public.professionals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS protect_professional_admin_fields_trg ON public.professionals;
DROP TRIGGER IF EXISTS professionals_protect_admin_fields ON public.professionals;
CREATE TRIGGER professionals_protect_admin_fields
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.protect_professional_admin_fields();

-- de-duplicate other double-registered triggers on bookings
DROP TRIGGER IF EXISTS enforce_verified_professional_trg ON public.bookings;
DROP TRIGGER IF EXISTS protect_booking_immutable_fields_trg ON public.bookings;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS update_patient_profiles_updated_at ON public.patient_profiles;
DROP TRIGGER IF EXISTS update_professionals_updated_at ON public.professionals;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
