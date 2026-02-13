
-- Add NUIT to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nuit text;

-- Add customer_nuit and transaction_id_external to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_nuit text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_id_external text;
