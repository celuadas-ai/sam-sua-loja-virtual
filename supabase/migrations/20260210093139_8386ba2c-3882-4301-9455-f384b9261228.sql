-- Add customer coordinates to orders table for distance/route calculation
ALTER TABLE public.orders
ADD COLUMN customer_latitude numeric NULL,
ADD COLUMN customer_longitude numeric NULL;