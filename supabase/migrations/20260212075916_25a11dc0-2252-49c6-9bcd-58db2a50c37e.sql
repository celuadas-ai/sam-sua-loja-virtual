
-- Add store_id to operators table
ALTER TABLE public.operators ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_operators_store_id ON public.operators(store_id);
