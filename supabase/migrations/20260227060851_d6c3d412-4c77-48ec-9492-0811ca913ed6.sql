
-- Add store_id to orders so we track which store handles each order
ALTER TABLE public.orders ADD COLUMN store_id uuid REFERENCES public.stores(id);

-- Function to auto-assign operator from nearest store
CREATE OR REPLACE FUNCTION public.auto_assign_operator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  nearest_store_id uuid;
  assigned_operator_id uuid;
BEGIN
  -- Only run on new orders without an operator
  IF NEW.operator_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- If customer has coordinates, find nearest active store
  IF NEW.customer_latitude IS NOT NULL AND NEW.customer_longitude IS NOT NULL THEN
    SELECT id INTO nearest_store_id
    FROM public.stores
    WHERE is_active = true
    ORDER BY (
      (latitude - NEW.customer_latitude) * (latitude - NEW.customer_latitude) +
      (longitude - NEW.customer_longitude) * (longitude - NEW.customer_longitude)
    ) ASC
    LIMIT 1;
  ELSE
    -- No coords: pick first active store
    SELECT id INTO nearest_store_id
    FROM public.stores
    WHERE is_active = true
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF nearest_store_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Set the store on the order
  NEW.store_id := nearest_store_id;

  -- Find an active operator assigned to this store (round-robin by fewest deliveries)
  SELECT o.user_id INTO assigned_operator_id
  FROM public.operators o
  WHERE o.store_id = nearest_store_id
    AND o.is_active = true
  ORDER BY o.deliveries_completed ASC
  LIMIT 1;

  IF assigned_operator_id IS NOT NULL THEN
    NEW.operator_id := assigned_operator_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on order insert
CREATE TRIGGER trg_auto_assign_operator
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_operator();
