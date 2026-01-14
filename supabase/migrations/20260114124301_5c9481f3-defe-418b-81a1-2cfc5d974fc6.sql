-- Fix: Replace permissive INSERT policy with proper security
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Only authenticated users and the trigger function can create notifications
CREATE POLICY "Authenticated can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);