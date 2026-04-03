
-- Allow anon to SELECT from professionals (view filters out sensitive columns)
CREATE POLICY "Anon can read professionals via view"
ON public.professionals
FOR SELECT
TO anon
USING (true);
