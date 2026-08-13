-- Revoke direct execution of internal SECURITY DEFINER trigger functions
REVOKE EXECUTE ON FUNCTION public.auto_assign_operator() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_validation_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_order_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role is required by RLS policies evaluated as the calling role; restrict to signed-in users only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Explicit fail-closed write rules on operators
DROP POLICY IF EXISTS "Only admins can insert operators" ON public.operators;
CREATE POLICY "Only admins can insert operators"
ON public.operators FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update operators" ON public.operators;
CREATE POLICY "Only admins can update operators"
ON public.operators FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete operators" ON public.operators;
CREATE POLICY "Only admins can delete operators"
ON public.operators FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));