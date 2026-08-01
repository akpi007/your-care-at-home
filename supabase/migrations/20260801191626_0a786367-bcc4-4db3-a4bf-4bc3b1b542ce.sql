
CREATE POLICY "Providers upload visit photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'visit-photos' AND owner = auth.uid());

CREATE POLICY "Participants read visit photos" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'visit-photos' AND (
    owner = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.visit_verifications v
      JOIN public.bookings b ON b.id = v.booking_id
      WHERE v.photo_url = storage.objects.name AND b.user_id = auth.uid()
    )
  )
);
