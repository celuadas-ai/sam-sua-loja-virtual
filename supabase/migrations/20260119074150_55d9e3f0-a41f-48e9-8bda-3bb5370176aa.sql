-- Fix critical security issue: Only system/admins/operators should create notifications
DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.notifications;

-- Create new restricted policy: Only operators and admins can create notifications
-- This ensures the trigger function still works (runs as SECURITY DEFINER) 
-- while preventing malicious users from creating fake notifications
CREATE POLICY "Only operators and admins can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'operator'::app_role)
);

-- Fix order_items: Operators should only see items from assigned orders  
DROP POLICY IF EXISTS "Operators can view all order items" ON public.order_items;

CREATE POLICY "Operators can view assigned order items"
ON public.order_items FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.operator_id = auth.uid())
  )
);