-- Seed: 002_seed_categories.sql
-- Description: Seed product categories from existing mock data
-- Source: grasp-react/src/data/products.js - categoriesData

-- Insert Categories
INSERT INTO categories (id, name, slug, code, description, image_url, is_featured, sort_order) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Polycarbonate Enclosures',
    'polycarbonate-enclosures',
    'GE-PC Series',
    'UV-stabilized transparent and opaque enclosures designed for HMI panels and outdoor applications.',
    '/images/categories/polycarbonate.jpg',
    TRUE,
    1
),
(
    'c0000000-0000-0000-0000-000000000002',
    'Metal Enclosures',
    'metal-enclosures',
    'GE-MT Series',
    'Powder-coated steel and aluminum enclosures engineered for harsh industrial environments.',
    '/images/categories/metal.jpg',
    TRUE,
    2
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Junction Boxes',
    'junction-boxes',
    'GE-JB Series',
    'Multi-entry junction boxes with DIN rail compatibility for flexible wiring configurations.',
    '/images/categories/junction.jpg',
    TRUE,
    3
),
(
    'c0000000-0000-0000-0000-000000000004',
    'Terminal Enclosures',
    'terminal-enclosures',
    'GE-TB Series',
    'Specialized enclosures for terminal blocks and distribution systems with rail mounting.',
    '/images/categories/terminal.jpg',
    FALSE,
    4
),
(
    'c0000000-0000-0000-0000-000000000005',
    'Hazardous Area Enclosures',
    'hazardous-area',
    'GE-HZ Series',
    'ATEX and IECEx certified enclosures designed for explosive and hazardous atmospheres.',
    '/images/categories/hazardous.jpg',
    TRUE,
    5
),
(
    'c0000000-0000-0000-0000-000000000006',
    'Custom Solutions',
    'custom-solutions',
    'GE-CS Series',
    'Tailored enclosure designs with CNC precision cutting and custom modifications.',
    '/images/categories/custom.jpg',
    FALSE,
    6
);

-- Insert Category Specs
INSERT INTO category_specs (category_id, spec_value, sort_order) VALUES
-- Polycarbonate Enclosures
('c0000000-0000-0000-0000-000000000001', 'IP67', 1),
('c0000000-0000-0000-0000-000000000001', 'UL94 V-0', 2),
-- Metal Enclosures
('c0000000-0000-0000-0000-000000000002', 'IP65', 1),
('c0000000-0000-0000-0000-000000000002', 'IK10', 2),
-- Junction Boxes
('c0000000-0000-0000-0000-000000000003', 'IP66', 1),
('c0000000-0000-0000-0000-000000000003', 'Modular', 2),
-- Terminal Enclosures
('c0000000-0000-0000-0000-000000000004', 'IP65', 1),
('c0000000-0000-0000-0000-000000000004', 'Rail Mount', 2),
-- Hazardous Area
('c0000000-0000-0000-0000-000000000005', 'Zone 1/2', 1),
('c0000000-0000-0000-0000-000000000005', 'ATEX', 2),
-- Custom Solutions
('c0000000-0000-0000-0000-000000000006', 'CAD Support', 1),
('c0000000-0000-0000-0000-000000000006', 'Prototyping', 2);
