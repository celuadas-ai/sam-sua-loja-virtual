-- Create table for driver GPS positions
CREATE TABLE public.driver_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(6, 2),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

-- Enable RLS
ALTER TABLE public.driver_positions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Operators can manage their positions"
ON public.driver_positions
FOR ALL
USING (has_role(auth.uid(), 'operator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view positions for their orders"
ON public.driver_positions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM orders
  WHERE orders.id = driver_positions.order_id
  AND orders.user_id = auth.uid()
));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_positions;

-- Trigger for updated_at
CREATE TRIGGER update_driver_positions_updated_at
BEFORE UPDATE ON public.driver_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();