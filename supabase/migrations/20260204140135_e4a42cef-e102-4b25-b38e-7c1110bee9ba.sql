-- Create operator stock table for car inventory management
CREATE TABLE public.operator_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(operator_id, product_id)
);

-- Enable RLS
ALTER TABLE public.operator_stock ENABLE ROW LEVEL SECURITY;

-- Operators can view and manage their own stock
CREATE POLICY "Operators can manage their own stock"
ON public.operator_stock
FOR ALL
USING (auth.uid() = operator_id)
WITH CHECK (auth.uid() = operator_id);

-- Admins have full access
CREATE POLICY "Admins have full access to operator stock"
ON public.operator_stock
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_operator_stock_updated_at
BEFORE UPDATE ON public.operator_stock
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();