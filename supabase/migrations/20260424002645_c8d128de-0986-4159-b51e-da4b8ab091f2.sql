-- Live GPS location sharing for active bookings
CREATE TABLE public.booking_locations (
  booking_id uuid PRIMARY KEY,
  professional_id uuid NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy numeric,
  is_sharing boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_locations ENABLE ROW LEVEL SECURITY;

-- Provider (owner of the booking's professional record) can upsert/update their location
CREATE POLICY "Professionals can insert own booking location"
ON public.booking_locations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professionals p
    WHERE p.id = booking_locations.professional_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can update own booking location"
ON public.booking_locations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p
    WHERE p.id = booking_locations.professional_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can delete own booking location"
ON public.booking_locations FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p
    WHERE p.id = booking_locations.professional_id AND p.user_id = auth.uid()
  )
);

-- Patient (booking owner) and the assigned professional can view
CREATE POLICY "Booking participants can view location"
ON public.booking_locations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_locations.booking_id
      AND (
        b.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.professionals p
          WHERE p.id = b.professional_id AND p.user_id = auth.uid()
        )
      )
  )
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_locations;
ALTER TABLE public.booking_locations REPLICA IDENTITY FULL;