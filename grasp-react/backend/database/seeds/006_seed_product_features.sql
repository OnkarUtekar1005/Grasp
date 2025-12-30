-- Seed: 006_seed_product_features.sql
-- Description: Seed product features (bullet points) from existing mock data

-- GE-PC-100 Clear Door Enclosure Features
INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
('p0000000-0000-0000-0000-000000000101', 'UV stabilized material', 1),
('p0000000-0000-0000-0000-000000000101', 'Clear door for visual inspection', 2),
('p0000000-0000-0000-0000-000000000101', 'Stainless steel hinges', 3),
('p0000000-0000-0000-0000-000000000101', 'Pre-formed mounting holes', 4),
('p0000000-0000-0000-0000-000000000101', 'Gasket seal included', 5),
('p0000000-0000-0000-0000-000000000101', 'Lockable latches', 6);

-- GE-PC-200 Large Format Enclosure Features
INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
('p0000000-0000-0000-0000-000000000102', 'Extra large internal space', 1),
('p0000000-0000-0000-0000-000000000102', 'Multiple cable entry options', 2),
('p0000000-0000-0000-0000-000000000102', 'DIN rail compatible', 3),
('p0000000-0000-0000-0000-000000000102', 'Modular design', 4),
('p0000000-0000-0000-0000-000000000102', 'UV stabilized', 5),
('p0000000-0000-0000-0000-000000000102', 'Impact resistant', 6);

-- GE-MT-100 Steel Wall Mount Features
INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
('p0000000-0000-0000-0000-000000000201', 'Powder coated finish', 1),
('p0000000-0000-0000-0000-000000000201', 'Removable mounting plate', 2),
('p0000000-0000-0000-0000-000000000201', 'Foam gasket seal', 3),
('p0000000-0000-0000-0000-000000000201', 'Stainless steel hardware', 4),
('p0000000-0000-0000-0000-000000000201', 'Knockouts provided', 5),
('p0000000-0000-0000-0000-000000000201', 'Earthing stud included', 6);

-- GE-JB-100 Multi-Entry Junction Box Features
INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
('p0000000-0000-0000-0000-000000000301', 'Multiple entry points', 1),
('p0000000-0000-0000-0000-000000000301', 'DIN rail compatible', 2),
('p0000000-0000-0000-0000-000000000301', 'Terminal block ready', 3),
('p0000000-0000-0000-0000-000000000301', 'Easy cable management', 4),
('p0000000-0000-0000-0000-000000000301', 'Hinged cover option', 5),
('p0000000-0000-0000-0000-000000000301', 'Transparent lid available', 6);

-- GE-TB-100 Terminal Block Enclosure Features
INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
('p0000000-0000-0000-0000-000000000401', 'Integrated DIN rail', 1),
('p0000000-0000-0000-0000-000000000401', 'Terminal block optimized', 2),
('p0000000-0000-0000-0000-000000000401', 'Clear marking areas', 3),
('p0000000-0000-0000-0000-000000000401', 'Quick release cover', 4),
('p0000000-0000-0000-0000-000000000401', 'Cable strain relief', 5),
('p0000000-0000-0000-0000-000000000401', 'Modular expansion', 6);

-- GE-HZ-100 ATEX Zone 1 Enclosure Features
INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
('p0000000-0000-0000-0000-000000000501', 'ATEX certified', 1),
('p0000000-0000-0000-0000-000000000501', 'IECEx certified', 2),
('p0000000-0000-0000-0000-000000000501', 'Flameproof design', 3),
('p0000000-0000-0000-0000-000000000501', 'Increased safety', 4),
('p0000000-0000-0000-0000-000000000501', 'Corrosion resistant', 5),
('p0000000-0000-0000-0000-000000000501', 'Ex-rated cable glands', 6);

-- Custom Enclosure Design Service Features
INSERT INTO product_features (product_id, feature_text, sort_order) VALUES
('p0000000-0000-0000-0000-000000000601', 'CAD design support', 1),
('p0000000-0000-0000-0000-000000000601', 'Rapid prototyping', 2),
('p0000000-0000-0000-0000-000000000601', 'CNC machining', 3),
('p0000000-0000-0000-0000-000000000601', 'Custom colors', 4),
('p0000000-0000-0000-0000-000000000601', 'Logo branding', 5),
('p0000000-0000-0000-0000-000000000601', 'Special certifications', 6);
