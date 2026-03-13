
-- Allow professionals to update bookings assigned to them (accept/reject)
CREATE POLICY "Professionals can update assigned bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM professionals
    WHERE professionals.id = bookings.professional_id
    AND professionals.user_id = auth.uid()
  )
);
