DROP POLICY IF EXISTS "Anyone can report an error" ON public.error_logs;

CREATE POLICY "Signed in users log own errors"
ON public.error_logs FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous visitors log anonymous errors"
ON public.error_logs FOR INSERT TO anon
WITH CHECK (user_id IS NULL);
