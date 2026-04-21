-- Update unit_label for all products to follow the new format X.YL x N

-- Água da Namaacha 0.5L products
UPDATE products SET unit_label = '0.5L x 6' WHERE volume = '0.5L' AND min_quantity = 6 AND brand = 'Água da Namaacha';
UPDATE products SET unit_label = '0.5L x 12' WHERE volume = '0.5L' AND min_quantity = 12 AND brand = 'Água da Namaacha';
UPDATE products SET unit_label = '0.5L x 24' WHERE volume = '0.5L' AND min_quantity = 24 AND brand = 'Água da Namaacha';

-- Água da Namaacha 1.5L products
UPDATE products SET unit_label = '1.5L x 6' WHERE volume = '1.5L' AND min_quantity = 6 AND brand = 'Água da Namaacha';
UPDATE products SET unit_label = '1.5L x 12' WHERE volume = '1.5L' AND min_quantity = 12 AND brand = 'Água da Namaacha';

-- Água da Namaacha 2.5L
UPDATE products SET unit_label = '2.5L x 6' WHERE volume = '2.5L' AND brand = 'Água da Namaacha';

-- Água da Namaacha 5L
UPDATE products SET unit_label = '5L x 5' WHERE volume = '5L' AND brand = 'Água da Namaacha';

-- Água com Gás 330ml
UPDATE products SET unit_label = '330ml x 6' WHERE volume = '330ml';

-- Fonte Fresca products
UPDATE products SET unit_label = '0.5L x 12' WHERE volume = '0.5L' AND brand = 'Fonte Fresca';
UPDATE products SET unit_label = '1.5L x 12' WHERE volume = '1.5L' AND brand = 'Fonte Fresca';
UPDATE products SET unit_label = '7L x 5' WHERE volume = '7L' AND unit_label LIKE '%Mín%5%' AND brand = 'Fonte Fresca';
UPDATE products SET unit_label = '7+7=14L (2 garrafões)' WHERE volume = '7+7=14L';

-- Natura / Ges20
UPDATE products SET unit_label = '18.9L x 1' WHERE volume = '18.9L';

-- Escolha Certa
UPDATE products SET unit_label = '7L x 5' WHERE volume = '7L' AND brand = 'Escolha Certa';