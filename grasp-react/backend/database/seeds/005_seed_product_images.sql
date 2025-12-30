-- Seed: 005_seed_product_images.sql
-- Description: Seed product images from existing mock data

-- GE-PC-100 Clear Door Enclosure Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
('p0000000-0000-0000-0000-000000000101', '/images/products/ge-pc-100-1.jpg', 'GE-PC-100 Clear Door Enclosure - Front View', TRUE, 1),
('p0000000-0000-0000-0000-000000000101', '/images/products/ge-pc-100-2.jpg', 'GE-PC-100 Clear Door Enclosure - Side View', FALSE, 2),
('p0000000-0000-0000-0000-000000000101', '/images/products/ge-pc-100-3.jpg', 'GE-PC-100 Clear Door Enclosure - Interior', FALSE, 3);

-- GE-PC-200 Large Format Enclosure Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
('p0000000-0000-0000-0000-000000000102', '/images/products/ge-pc-200-1.jpg', 'GE-PC-200 Large Format Enclosure', TRUE, 1);

-- GE-MT-100 Steel Wall Mount Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
('p0000000-0000-0000-0000-000000000201', '/images/products/ge-mt-100-1.jpg', 'GE-MT-100 Steel Wall Mount Enclosure', TRUE, 1);

-- GE-JB-100 Multi-Entry Junction Box Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
('p0000000-0000-0000-0000-000000000301', '/images/products/ge-jb-100-1.jpg', 'GE-JB-100 Multi-Entry Junction Box', TRUE, 1);

-- GE-TB-100 Terminal Block Enclosure Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
('p0000000-0000-0000-0000-000000000401', '/images/products/ge-tb-100-1.jpg', 'GE-TB-100 Terminal Block Enclosure', TRUE, 1);

-- GE-HZ-100 ATEX Zone 1 Enclosure Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
('p0000000-0000-0000-0000-000000000501', '/images/products/ge-hz-100-1.jpg', 'GE-HZ-100 ATEX Zone 1 Enclosure', TRUE, 1);

-- Custom Enclosure Design Service Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
('p0000000-0000-0000-0000-000000000601', '/images/products/custom-service.jpg', 'Custom Enclosure Design Service', TRUE, 1);
