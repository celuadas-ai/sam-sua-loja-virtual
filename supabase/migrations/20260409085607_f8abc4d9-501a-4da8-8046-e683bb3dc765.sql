CREATE POLICY "Customers can view operator profiles for their orders"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.user_id = auth.uid()
      AND orders.operator_id = profiles.id
      AND orders.status <> 'delivered'::order_status
  )
);