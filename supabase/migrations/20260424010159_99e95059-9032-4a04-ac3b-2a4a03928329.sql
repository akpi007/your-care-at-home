-- 1. Fix overly permissive realtime.messages SELECT policy
DROP POLICY IF EXISTS "Authenticated users can receive realtime broadcasts" ON realtime.messages;

-- Restrict realtime channel subscriptions to booking participants only.
-- Channel topic convention: 'booking:<booking_id>' or topic equals booking id.
CREATE POLICY "Booking participants can subscribe to realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE (
      realtime.topic() = b.id::text
      OR realtime.topic() = 'booking:' || b.id::text
      OR realtime.topic() LIKE '%' || b.id::text || '%'
    )
    AND (
      b.user_id = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.professionals p
        WHERE p.id = b.professional_id AND p.user_id = (SELECT auth.uid())
      )
    )
  )
);

-- 2. Remove broad messages table SELECT policy that bypassed booking-participant check
DROP POLICY IF EXISTS "Authenticated users can receive realtime broadcasts" ON public.messages;

-- 3. Remove overly permissive push_subscriptions SELECT policy (if exists)
DROP POLICY IF EXISTS "Service can read all subscriptions" ON public.push_subscriptions;

-- 4. Make provider-documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'provider-documents';