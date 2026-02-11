
-- Add SKU field to products
ALTER TABLE public.products ADD COLUMN sku text;

-- Add sequential order number to orders
ALTER TABLE public.orders ADD COLUMN order_number serial;

-- Create unique index on SKU
CREATE UNIQUE INDEX idx_products_sku ON public.products (sku) WHERE sku IS NOT NULL;

-- Create unique index on order_number
CREATE UNIQUE INDEX idx_orders_order_number ON public.orders (order_number);
