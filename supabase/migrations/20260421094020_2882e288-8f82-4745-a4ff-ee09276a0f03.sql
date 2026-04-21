-- Fix Namaacha 0.5L products (2 have unit_label='pack' - need to differentiate)
-- One is pack6, one is pack12. Will update based on min_quantity
UPDATE products SET unit_label = '0.5L x 6' WHERE volume = '0.5L' AND min_quantity = 6 AND brand = 'Água da Namaacha';
UPDATE products SET unit_label = '0.5L x 12' WHERE volume = '0.5L' AND min_quantity = 12 AND brand = 'Água da Namaacha';
UPDATE products SET unit_label = '0.5L x 24' WHERE volume = '0.5L' AND unit_label = 'caixa' AND brand = 'Água da Namaacha';

-- Fix Namaacha 1.5L products
UPDATE products SET unit_label = '1.5L x 6' WHERE volume = '1.5L' AND unit_label = 'pack' AND brand = 'Água da Namaacha';
UPDATE products SET unit_label = '1.5L x 12' WHERE volume = '1.5L' AND unit_label = 'caixa' AND brand = 'Água da Namaacha';