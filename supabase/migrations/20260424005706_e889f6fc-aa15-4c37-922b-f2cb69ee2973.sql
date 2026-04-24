-- 1. Add DELETE policy for provider-documents storage bucket (owner folder scope)
CREATE POLICY "Professionals can delete own provider documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'provider-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Harden user_roles INSERT against any bootstrap/race by adding a RESTRICTIVE policy.
-- RESTRICTIVE policies are AND-combined with permissive ones, so this enforces admin
-- regardless of any future permissive policy and eliminates the privilege-escalation gap.
CREATE POLICY "Restrict user_roles inserts to admins only"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));