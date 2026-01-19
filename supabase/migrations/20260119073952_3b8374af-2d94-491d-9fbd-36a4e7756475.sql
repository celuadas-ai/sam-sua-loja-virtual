-- Fix security issue: Operators should only see orders assigned to them
-- Add DELETE policies for user data

-- Drop existing operator SELECT policy for orders
DROP POLICY IF EXISTS "Operators can view all orders" ON public.orders;

-- Create new policy: Operators can only view orders assigned to them
CREATE POLICY "Operators can view assigned orders" 
ON public.orders FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'operator'::app_role) AND operator_id = auth.uid())
);

-- Add DELETE policy for notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for user_settings
CREATE POLICY "Users can delete their own settings"
ON public.user_settings FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for profiles (own profile only)
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);