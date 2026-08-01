
-- Admin support mode: read-only access to bookings and profiles
CREATE POLICY "Admins view all bookings" ON public.bookings
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Reminder notifications (24h and 1h before a booking)
CREATE OR REPLACE FUNCTION public.send_booking_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  window_label text;
BEGIN
  FOR r IN
    SELECT b.id, b.user_id, b.booking_date, b.booking_time,
           p.user_id AS pro_user_id, p.display_name,
           (b.booking_date + b.booking_time) AS starts_at
    FROM public.bookings b
    JOIN public.professionals p ON p.id = b.professional_id
    WHERE b.status IN ('pending','confirmed')
      AND (b.booking_date + b.booking_time) BETWEEN now() AND now() + interval '25 hours'
  LOOP
    IF r.starts_at BETWEEN now() + interval '23 hours' AND now() + interval '25 hours' THEN
      window_label := '24h';
    ELSIF r.starts_at BETWEEN now() AND now() + interval '1 hour' THEN
      window_label := '1h';
    ELSE
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = r.user_id
        AND n.type = 'reminder'
        AND n.link = '/dashboard'
        AND n.body LIKE '%' || r.id::text || '%'
        AND n.body LIKE '%' || window_label || '%'
    ) THEN
      INSERT INTO public.notifications (user_id, title, body, type, link)
      VALUES (
        r.user_id,
        CASE WHEN window_label = '24h' THEN 'Appointment tomorrow' ELSE 'Appointment in 1 hour' END,
        'Visit with ' || coalesce(r.display_name, 'your provider') || ' on ' || to_char(r.booking_date, 'DD Mon') ||
        ' at ' || to_char(r.booking_time, 'HH24:MI') || ' [' || window_label || ':' || r.id::text || ']',
        'reminder',
        '/dashboard'
      );

      IF r.pro_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, body, type, link)
        VALUES (
          r.pro_user_id,
          CASE WHEN window_label = '24h' THEN 'Visit tomorrow' ELSE 'Visit in 1 hour' END,
          'You have a visit on ' || to_char(r.booking_date, 'DD Mon') || ' at ' || to_char(r.booking_time, 'HH24:MI') ||
          ' [' || window_label || ':' || r.id::text || ']',
          'reminder',
          '/provider-dashboard'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.send_booking_reminders() FROM PUBLIC, anon, authenticated;

-- Licence expiry reminders for providers
CREATE OR REPLACE FUNCTION public.send_licence_expiry_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.user_id, p.licence_expiry
    FROM public.professionals p
    WHERE p.user_id IS NOT NULL
      AND p.licence_expiry IS NOT NULL
      AND p.licence_expiry BETWEEN current_date AND current_date + 30
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = r.user_id AND n.type = 'licence_expiry'
        AND n.created_at > now() - interval '7 days'
    ) THEN
      INSERT INTO public.notifications (user_id, title, body, type, link)
      VALUES (r.user_id, 'Licence expiring soon',
              'Your practising licence expires on ' || to_char(r.licence_expiry, 'DD Mon YYYY') || '. Upload a renewed copy to stay verified.',
              'licence_expiry', '/provider-dashboard');
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.send_licence_expiry_reminders() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('booking_reminders', '*/15 * * * *', $$SELECT public.send_booking_reminders();$$);
SELECT cron.schedule('licence_expiry_reminders', '0 9 * * *', $$SELECT public.send_licence_expiry_reminders();$$);
