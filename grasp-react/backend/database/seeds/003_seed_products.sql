-- Seed: 003_seed_products.sql
-- Description: Seed products from existing mock data
-- Source: grasp-react/src/data/products.js - productsData

-- GE-PC-100 Clear Door Enclosure
INSERT INTO products (
    id, category_id, name, slug, code, description, full_description,
    spec_material, spec_ip_rating, spec_flammability, spec_color,
    spec_door_type, spec_mounting, spec_temperature_range,
    is_featured, is_active, created_at
) VALUES (
    'p0000000-0000-0000-0000-000000000101',
    'c0000000-0000-0000-0000-000000000001',
    'GE-PC-100 Clear Door Enclosure',
    'ge-pc-100-clear-door',
    'GE-PC-100',
    'Compact polycarbonate enclosure with clear door for visual monitoring of internal components.',
    'The GE-PC-100 is a premium polycarbonate enclosure featuring a crystal-clear door that allows for easy visual inspection of internal components without opening the unit.

Designed for indoor and outdoor applications, this enclosure offers excellent UV resistance and maintains clarity even after prolonged sun exposure. The high-impact polycarbonate construction ensures durability while remaining lightweight for easy installation.

Perfect for HMI panels, PLCs, and other electronic equipment that requires visual monitoring.',
    'Polycarbonate (PC)',
    'IP67',
    'UL94 V-0',
    'Grey RAL 7035',
    'Clear Polycarbonate',
    'Wall Mount',
    '-40°C to +80°C',
    TRUE,
    TRUE,
    '2024-01-15'
);

-- GE-PC-200 Large Format Enclosure
INSERT INTO products (
    id, category_id, name, slug, code, description, full_description,
    spec_material, spec_ip_rating, spec_flammability, spec_color,
    spec_door_type, spec_mounting, spec_temperature_range,
    is_featured, is_active, created_at
) VALUES (
    'p0000000-0000-0000-0000-000000000102',
    'c0000000-0000-0000-0000-000000000001',
    'GE-PC-200 Large Format Enclosure',
    'ge-pc-200-large-format',
    'GE-PC-200',
    'Large polycarbonate enclosure for bigger installations requiring maximum protection.',
    'The GE-PC-200 offers generous internal space for larger installations while maintaining the superior protection standards of our polycarbonate series.',
    'Polycarbonate (PC)',
    'IP67',
    'UL94 V-0',
    'Grey RAL 7035',
    'Opaque/Clear Options',
    'Wall/Floor Mount',
    '-40°C to +80°C',
    FALSE,
    TRUE,
    '2024-01-20'
);

-- GE-MT-100 Steel Wall Mount
INSERT INTO products (
    id, category_id, name, slug, code, description, full_description,
    spec_material, spec_ip_rating, spec_flammability, spec_color,
    spec_door_type, spec_mounting, spec_temperature_range,
    is_featured, is_active, created_at
) VALUES (
    'p0000000-0000-0000-0000-000000000201',
    'c0000000-0000-0000-0000-000000000002',
    'GE-MT-100 Steel Wall Mount',
    'ge-mt-100-steel-wall',
    'GE-MT-100',
    'Heavy-duty steel enclosure with powder coating for industrial environments.',
    'The GE-MT-100 is built for demanding industrial applications where durability is paramount. Constructed from cold-rolled steel with a high-quality powder coat finish, this enclosure provides excellent protection against corrosion and physical impact.',
    'Cold Rolled Steel (CRS)',
    'IP65',
    NULL,
    'Grey RAL 7032',
    NULL,
    'Wall Mount',
    '-25°C to +60°C',
    TRUE,
    TRUE,
    '2024-02-01'
);

-- GE-JB-100 Multi-Entry Junction Box
INSERT INTO products (
    id, category_id, name, slug, code, description, full_description,
    spec_material, spec_ip_rating, spec_flammability, spec_color,
    spec_door_type, spec_mounting, spec_temperature_range,
    is_featured, is_active, created_at
) VALUES (
    'p0000000-0000-0000-0000-000000000301',
    'c0000000-0000-0000-0000-000000000003',
    'GE-JB-100 Multi-Entry Junction Box',
    'ge-jb-100-multi-entry',
    'GE-JB-100',
    'Versatile junction box with multiple cable entries for complex wiring requirements.',
    'The GE-JB-100 is designed for applications requiring multiple cable entries and flexible internal configurations. Features pre-formed knockouts on all sides for maximum installation flexibility.',
    'ABS/Polycarbonate',
    'IP66',
    NULL,
    NULL,
    NULL,
    'Surface Mount',
    '-25°C to +60°C',
    FALSE,
    TRUE,
    '2024-02-15'
);

-- GE-TB-100 Terminal Block Enclosure
INSERT INTO products (
    id, category_id, name, slug, code, description, full_description,
    spec_material, spec_ip_rating, spec_flammability, spec_color,
    spec_door_type, spec_mounting, spec_temperature_range,
    is_featured, is_active, created_at
) VALUES (
    'p0000000-0000-0000-0000-000000000401',
    'c0000000-0000-0000-0000-000000000004',
    'GE-TB-100 Terminal Block Enclosure',
    'ge-tb-100-terminal-block',
    'GE-TB-100',
    'Compact enclosure optimized for terminal block installations.',
    'Purpose-built for terminal block applications, the GE-TB-100 features integrated DIN rail mounting and optimized internal dimensions for efficient cable termination.',
    'Polycarbonate',
    'IP65',
    NULL,
    NULL,
    NULL,
    'Rail/Wall Mount',
    '-25°C to +70°C',
    FALSE,
    TRUE,
    '2024-03-01'
);

-- GE-HZ-100 ATEX Zone 1 Enclosure
INSERT INTO products (
    id, category_id, name, slug, code, description, full_description,
    spec_material, spec_ip_rating, spec_flammability, spec_color,
    spec_door_type, spec_mounting, spec_temperature_range,
    is_featured, is_active, created_at
) VALUES (
    'p0000000-0000-0000-0000-000000000501',
    'c0000000-0000-0000-0000-000000000005',
    'GE-HZ-100 ATEX Zone 1 Enclosure',
    'ge-hz-100-atex-zone1',
    'GE-HZ-100',
    'ATEX certified enclosure for use in hazardous Zone 1 and Zone 2 areas.',
    'The GE-HZ-100 is fully certified for use in explosive atmospheres. ATEX and IECEx certified for Zone 1 and Zone 2 applications, this enclosure meets the stringent requirements for hazardous area installations.',
    'GRP/Stainless Steel',
    'IP66',
    NULL,
    NULL,
    NULL,
    NULL,
    '-50°C to +65°C',
    TRUE,
    TRUE,
    '2024-03-15'
);

-- Custom Enclosure Design Service
INSERT INTO products (
    id, category_id, name, slug, code, description, full_description,
    spec_material, spec_ip_rating, spec_flammability, spec_color,
    spec_door_type, spec_mounting, spec_temperature_range,
    is_featured, is_active, created_at
) VALUES (
    'p0000000-0000-0000-0000-000000000601',
    'c0000000-0000-0000-0000-000000000006',
    'Custom Enclosure Design Service',
    'custom-enclosure-design',
    'GE-CS-CUSTOM',
    'Bespoke enclosure solutions tailored to your exact specifications.',
    'Our custom design service offers complete flexibility in enclosure design. From modified standard products to completely bespoke solutions, our engineering team works with you to create the perfect enclosure for your application.',
    'Various Options',
    'Up to IP68',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    FALSE,
    TRUE,
    '2024-01-01'
);
