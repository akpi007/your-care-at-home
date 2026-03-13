-- Allow professionals to delete their own availability (needed for re-saving schedule)
CREATE POLICY "Professionals can delete own availability"
ON public.availability
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM professionals
    WHERE professionals.id = availability.professional_id
    AND professionals.user_id = auth.uid()
  )
);