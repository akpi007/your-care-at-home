
-- 1) Messages: tighten INSERT to require sender be a booking participant
DROP POLICY IF EXISTS "Booking participants can send messages" ON public.messages;
CREATE POLICY "Booking participants can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = messages.booking_id
      AND (
        b.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.professionals p
          WHERE p.id = b.professional_id AND p.user_id = auth.uid()
        )
      )
  )
);

-- 2) Realtime channel authorization for booking-scoped topics and booking_locations
DROP POLICY IF EXISTS "Booking participants can subscribe to booking channel" ON realtime.messages;
CREATE POLICY "Booking participants can subscribe to booking channel"
ON realtime.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE (
      realtime.topic() = b.id::text
      OR realtime.topic() = 'booking:' || b.id::text
      OR realtime.topic() = 'booking-location-' || b.id::text
      OR realtime.topic() = 'bookings-patient-' || b.user_id::text
    )
    AND (
      b.user_id = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.professionals p
        WHERE p.id = b.professional_id AND p.user_id = (SELECT auth.uid())
      )
    )
  )
);

-- 3) Earnings: explicit deny for client-side writes (service role bypasses RLS)
CREATE POLICY "Deny client inserts on earnings"
ON public.earnings FOR INSERT TO authenticated
WITH CHECK (false);
CREATE POLICY "Deny client updates on earnings"
ON public.earnings FOR UPDATE TO authenticated
USING (false) WITH CHECK (false);
CREATE POLICY "Deny client deletes on earnings"
ON public.earnings FOR DELETE TO authenticated
USING (false);

-- 4) Payments: allow professionals to view payments for their assigned bookings; deny client writes
CREATE POLICY "Professionals can view payments for assigned bookings"
ON public.payments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.professionals p ON p.id = b.professional_id
    WHERE b.id = payments.booking_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Deny client inserts on payments"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (false);
CREATE POLICY "Deny client updates on payments"
ON public.payments FOR UPDATE TO authenticated
USING (false) WITH CHECK (false);
CREATE POLICY "Deny client deletes on payments"
ON public.payments FOR DELETE TO authenticated
USING (false);

-- 5) Professionals: revoke anon column access to sensitive identity fields as belt-and-suspenders
REVOKE SELECT (license_number, id_proof_url, passport_photo_url) ON public.professionals FROM anon;
REVOKE SELECT (license_number, id_proof_url, passport_photo_url) ON public.professionals FROM PUBLIC;

-- 6) SECURITY DEFINER function: restrict EXECUTE to authenticated + service_role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
