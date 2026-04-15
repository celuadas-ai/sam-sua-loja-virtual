
-- Add validation_code column to orders
ALTER TABLE public.orders ADD COLUMN validation_code TEXT;

-- Create function to auto-generate validation code
CREATE OR REPLACE FUNCTION public.generate_validation_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.validation_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate on insert
CREATE TRIGGER set_validation_code
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_validation_code();

-- Backfill existing orders
UPDATE public.orders SET validation_code = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0') WHERE validation_code IS NULL;
