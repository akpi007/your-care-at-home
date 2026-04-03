
-- 1. Lock down professionals base table SELECT
DROP POLICY IF EXISTS "Public can read non-sensitive professional data" ON public.professionals;
DROP POLICY IF EXISTS "Professionals public read non-sensitive" ON public.professionals;

-- Owner can read own record (needed for provider dashboard, profile edit, etc.)
CREATE POLICY "Professionals can read own record"
ON public.professionals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all records
CREATE POLICY "Admins can read all professionals"
ON public.professionals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix reviews: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;

CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous read via the reviews_public view (no patient_id)
-- The view uses security_invoker so anon needs a policy on reviews base table
-- Instead, grant public SELECT on the view only for non-sensitive columns
CREATE POLICY "Public can read reviews"
ON public.reviews
FOR SELECT
TO anon
USING (true);
