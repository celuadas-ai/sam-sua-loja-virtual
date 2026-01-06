-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  volume TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  min_quantity INTEGER NOT NULL DEFAULT 1,
  unit_label TEXT NOT NULL,
  is_promo BOOLEAN NOT NULL DEFAULT false,
  promo_price NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
-- Everyone can view active products (public catalog)
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true);

-- Admins have full access
CREATE POLICY "Admins have full access to products" 
ON public.products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_promo ON public.products(is_promo);

-- Insert initial products data
INSERT INTO public.products (id, name, brand, volume, price, image_url, min_quantity, unit_label) VALUES
  (gen_random_uuid(), 'Água Namaacha', 'Água da Namaacha', '0.5L', 25, '/assets/namaacha-500ml-pack6.png', 6, '1 pack (6un)'),
  (gen_random_uuid(), 'Água Namaacha', 'Água da Namaacha', '0.5L', 25, '/assets/namaacha-500ml-pack12.png', 12, '1 pack (12un)'),
  (gen_random_uuid(), 'Água Namaacha', 'Água da Namaacha', '0.5L', 25, '/assets/namaacha-500ml.png', 24, '1 caixa (24un)'),
  (gen_random_uuid(), 'Água Namaacha', 'Água da Namaacha', '1.5L', 45, '/assets/namaacha-1.5l-pack6.png', 6, '1 pack (6un)'),
  (gen_random_uuid(), 'Água Namaacha', 'Água da Namaacha', '1.5L', 45, '/assets/namaacha-1.5l.png', 12, '1 caixa (12un)'),
  (gen_random_uuid(), 'Água Namaacha', 'Água da Namaacha', '2.5L', 65, '/assets/namaacha-2.5l.png', 6, '1 pack (6un)'),
  (gen_random_uuid(), 'Água Namaacha', 'Água da Namaacha', '5L', 95, '/assets/namaacha-5l.png', 5, 'Mín. 5 garrafões'),
  (gen_random_uuid(), 'Água com Gás', 'Água da Namaacha', '330ml', 30, '/assets/agua-gas-330ml.png', 6, '1 pack (6un)'),
  (gen_random_uuid(), 'Água Fonte Fresca', 'Fonte Fresca', '0.5L', 20, '/assets/ff-500ml.png', 12, '1 pack (12un)'),
  (gen_random_uuid(), 'Água Fonte Fresca', 'Fonte Fresca', '1.5L', 40, '/assets/ff-1.5l.png', 12, '1 pack (12un)'),
  (gen_random_uuid(), 'Água Fonte Fresca', 'Fonte Fresca', '7L', 120, '/assets/ff-7l.png', 5, 'Mín. 5 garrafões'),
  (gen_random_uuid(), 'Garrafão Natura', 'Natura / Ges20', '18.9L', 250, '/assets/natura-18.9l.png', 1, 'Mín. 1 galão'),
  (gen_random_uuid(), 'Água Escolha Certa', 'Escolha Certa', '7L', 100, '/assets/escolha-certa-7l.png', 5, 'Mín. 5 garrafões');