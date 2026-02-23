
-- 1. Fix: Operators can only view orders actively assigned to them (not delivered)
DROP POLICY IF EXISTS "Operators can view assigned orders" ON public.orders;
CREATE POLICY "Operators can view assigned orders"
ON public.orders
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'operator'::app_role)
    AND operator_id = auth.uid()
    AND status != 'delivered'
  )
);

-- 2. Fix: Customers can only view driver positions for active (non-delivered) orders
DROP POLICY IF EXISTS "Users can view positions for their orders" ON public.driver_positions;
CREATE POLICY "Users can view positions for their orders"
ON public.driver_positions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = driver_positions.order_id
      AND orders.user_id = auth.uid()
      AND orders.status != 'delivered'
  )
);
