
-- Restrict professional_certifications SELECT to owner + admin
DROP POLICY IF EXISTS "Certifications viewable by everyone" ON public.professional_certifications;

CREATE POLICY "Professionals can view own certifications"
ON public.professional_certifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = professional_certifications.professional_id
    AND professionals.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);
