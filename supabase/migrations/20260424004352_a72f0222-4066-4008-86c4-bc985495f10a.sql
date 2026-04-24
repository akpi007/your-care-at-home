-- 1. Recreate views without SECURITY DEFINER (use security_invoker)
DROP VIEW IF EXISTS public.professionals_public;
CREATE VIEW public.professionals_public
WITH (security_invoker = true) AS
SELECT id, user_id, years_experience, consultation_fee, rating, total_reviews,
       service_id, available, created_at, updated_at, display_name,
       specialization, bio, image_url, city, verification_status
FROM public.professionals;

DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public
WITH (security_invoker = true) AS
SELECT id, booking_id, professional_id, rating, created_at, comment
FROM public.reviews;

-- 2. Harden user_roles: ensure no UPDATE policy allows self-modification.
-- Add explicit restrictive policy preventing self-insert by non-admins.
-- The existing "Admins can insert roles" policy already requires admin, but make it explicit and add deny for non-admins.
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Explicitly deny UPDATE on user_roles (no policy = no access, but make explicit)
DROP POLICY IF EXISTS "Deny all updates on user_roles" ON public.user_roles;
CREATE POLICY "Deny all updates on user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- 3. Restrict realtime subscriptions: add RLS on realtime.messages to require auth
-- Supabase realtime authorization: only authenticated users, and rely on per-table RLS for payload filtering.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive realtime broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can receive realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
