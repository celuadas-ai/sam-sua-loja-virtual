
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(phone)
);

-- No RLS - only accessed by service role from edge functions
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;
