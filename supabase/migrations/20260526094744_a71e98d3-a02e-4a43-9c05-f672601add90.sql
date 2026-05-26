-- phone_otps already has RLS enabled but no policies.
-- Explicitly deny all client access; edge functions use service_role and bypass RLS.
CREATE POLICY "Deny all client select on phone_otps"
  ON public.phone_otps FOR SELECT
  USING (false);

CREATE POLICY "Deny all client insert on phone_otps"
  ON public.phone_otps FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny all client update on phone_otps"
  ON public.phone_otps FOR UPDATE
  USING (false);

CREATE POLICY "Deny all client delete on phone_otps"
  ON public.phone_otps FOR DELETE
  USING (false);