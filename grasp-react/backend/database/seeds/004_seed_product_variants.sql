-- Seed: 004_seed_product_variants.sql
-- Description: Seed product variants (sizes) from existing mock data
-- Each product gets at least one variant representing its default size

-- GE-PC-100 Clear Door Enclosure - Variants
INSERT INTO product_variants (id, product_id, sku, name, spec_dimensions, stock_quantity, low_stock_threshold, sort_order) VALUES
('v0000000-0000-0000-0000-000000101001', 'p0000000-0000-0000-0000-000000000101', 'GE-PC-100-S', '200 x 150 x 100 mm', '200 x 150 x 100 mm', 50, 10, 1),
('v0000000-0000-0000-0000-000000101002', 'p0000000-0000-0000-0000-000000000101', 'GE-PC-100-M', '250 x 200 x 120 mm', '250 x 200 x 120 mm', 35, 10, 2),
('v0000000-0000-0000-0000-000000101003', 'p0000000-0000-0000-0000-000000000101', 'GE-PC-100-L', '300 x 250 x 150 mm', '300 x 250 x 150 mm', 20, 10, 3);

-- GE-PC-200 Large Format Enclosure - Variants
INSERT INTO product_variants (id, product_id, sku, name, spec_dimensions, stock_quantity, low_stock_threshold, sort_order) VALUES
('v0000000-0000-0000-0000-000000102001', 'p0000000-0000-0000-0000-000000000102', 'GE-PC-200-M', '400 x 300 x 200 mm', '400 x 300 x 200 mm', 25, 5, 1),
('v0000000-0000-0000-0000-000000102002', 'p0000000-0000-0000-0000-000000000102', 'GE-PC-200-L', '500 x 400 x 250 mm', '500 x 400 x 250 mm', 15, 5, 2),
('v0000000-0000-0000-0000-000000102003', 'p0000000-0000-0000-0000-000000000102', 'GE-PC-200-XL', '600 x 500 x 300 mm', '600 x 500 x 300 mm', 10, 5, 3);

-- GE-MT-100 Steel Wall Mount - Variants
INSERT INTO product_variants (id, product_id, sku, name, spec_dimensions, spec_weight, stock_quantity, low_stock_threshold, sort_order) VALUES
('v0000000-0000-0000-0000-000000201001', 'p0000000-0000-0000-0000-000000000201', 'GE-MT-100-S', '300 x 250 x 150 mm', '300 x 250 x 150 mm', '4.5 kg', 40, 10, 1),
('v0000000-0000-0000-0000-000000201002', 'p0000000-0000-0000-0000-000000000201', 'GE-MT-100-M', '400 x 300 x 200 mm', '400 x 300 x 200 mm', '6.2 kg', 30, 10, 2),
('v0000000-0000-0000-0000-000000201003', 'p0000000-0000-0000-0000-000000000201', 'GE-MT-100-L', '500 x 400 x 250 mm', '500 x 400 x 250 mm', '8.8 kg', 20, 10, 3);

-- GE-JB-100 Multi-Entry Junction Box - Variants
INSERT INTO product_variants (id, product_id, sku, name, spec_dimensions, stock_quantity, low_stock_threshold, sort_order) VALUES
('v0000000-0000-0000-0000-000000301001', 'p0000000-0000-0000-0000-000000000301', 'GE-JB-100-S', '150 x 150 x 90 mm', '150 x 150 x 90 mm', 100, 20, 1),
('v0000000-0000-0000-0000-000000301002', 'p0000000-0000-0000-0000-000000000301', 'GE-JB-100-M', '200 x 200 x 100 mm', '200 x 200 x 100 mm', 75, 15, 2),
('v0000000-0000-0000-0000-000000301003', 'p0000000-0000-0000-0000-000000000301', 'GE-JB-100-L', '250 x 250 x 120 mm', '250 x 250 x 120 mm', 50, 10, 3);

-- GE-TB-100 Terminal Block Enclosure - Variants
INSERT INTO product_variants (id, product_id, sku, name, spec_dimensions, stock_quantity, low_stock_threshold, sort_order) VALUES
('v0000000-0000-0000-0000-000000401001', 'p0000000-0000-0000-0000-000000000401', 'GE-TB-100-S', '200 x 120 x 75 mm', '200 x 120 x 75 mm', 60, 15, 1),
('v0000000-0000-0000-0000-000000401002', 'p0000000-0000-0000-0000-000000000401', 'GE-TB-100-M', '250 x 150 x 90 mm', '250 x 150 x 90 mm', 45, 10, 2),
('v0000000-0000-0000-0000-000000401003', 'p0000000-0000-0000-0000-000000000401', 'GE-TB-100-L', '300 x 180 x 100 mm', '300 x 180 x 100 mm', 30, 10, 3);

-- GE-HZ-100 ATEX Zone 1 Enclosure - Variants
INSERT INTO product_variants (id, product_id, sku, name, spec_dimensions, spec_weight, stock_quantity, low_stock_threshold, sort_order) VALUES
('v0000000-0000-0000-0000-000000501001', 'p0000000-0000-0000-0000-000000000501', 'GE-HZ-100-S', '300 x 250 x 150 mm', '300 x 250 x 150 mm', '7.5 kg', 15, 5, 1),
('v0000000-0000-0000-0000-000000501002', 'p0000000-0000-0000-0000-000000000501', 'GE-HZ-100-M', '400 x 350 x 200 mm', '400 x 350 x 200 mm', '12.0 kg', 10, 5, 2),
('v0000000-0000-0000-0000-000000501003', 'p0000000-0000-0000-0000-000000000501', 'GE-HZ-100-L', '500 x 400 x 250 mm', '500 x 400 x 250 mm', '18.5 kg', 8, 3, 3);

-- Custom Enclosure Design Service - Single "variant" (not a physical product)
INSERT INTO product_variants (id, product_id, sku, name, spec_dimensions, stock_quantity, low_stock_threshold, sort_order) VALUES
('v0000000-0000-0000-0000-000000601001', 'p0000000-0000-0000-0000-000000000601', 'GE-CS-CUSTOM', 'Custom Size', 'As per requirements', 999, 0, 1);
