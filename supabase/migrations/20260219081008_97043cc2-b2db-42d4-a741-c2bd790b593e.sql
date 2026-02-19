
-- Replace permissive INSERT policy with a restrictive one
-- Only SECURITY DEFINER triggers insert notifications, so no user needs direct INSERT
DROP POLICY "System can insert notifications" ON public.notifications;

CREATE POLICY "No direct insert"
ON public.notifications FOR INSERT
WITH CHECK (false);
