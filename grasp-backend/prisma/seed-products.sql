-- Seed Product Dynamic Specs and Features
-- Run this SQL to populate all products with common specs and features

-- First, clear existing specs and features (optional - uncomment if needed)
-- DELETE FROM product_dynamic_specs;
-- DELETE FROM product_features;

-- =====================================================
-- INSERT DYNAMIC SPECS FOR ALL PRODUCTS
-- =====================================================

INSERT INTO product_dynamic_specs (id, product_id, spec_key, spec_value, sort_order)
SELECT
    gen_random_uuid(),
    p.id,
    spec.key,
    spec.value,
    spec.sort_order
FROM products p
CROSS JOIN (
    VALUES
        ('Environment Protection', 'ROHS and Halogen Free', 0),
        ('Fire Rating', 'UL94V-0', 1),
        ('ROHS Compliance', 'IEC 62321', 2),
        ('Ambient Temperature', '-25 to +80 Deg. C', 3),
        ('Glow Wire Test', '960 Deg. C as per IS 11000-2-1, IEC 60695-2-10', 4),
        ('Impact Resistance', 'IK08/IK 07 as per IEC 60068-2-72', 5),
        ('Ultraviolet Protection', 'UV Stabilised as per EN ISO 4892', 6),
        ('Ingress Protection', 'IP 67 as per IEC-60529', 7),
        ('Material', 'ABS/PC, with Transparent and Opaque Lid options', 8),
        ('Dimension', '180X180X100 mm', 9)
) AS spec(key, value, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM product_dynamic_specs pds
    WHERE pds.product_id = p.id AND pds.spec_key = spec.key
);

-- =====================================================
-- INSERT FEATURES FOR ALL PRODUCTS
-- =====================================================

INSERT INTO product_features (id, product_id, feature_text, sort_order)
SELECT
    gen_random_uuid(),
    p.id,
    feature.text,
    feature.sort_order
FROM products p
CROSS JOIN (
    VALUES
        ('Plain walled enclosures.', 0),
        ('Rust proof polymer screws.', 1),
        ('Gland holes/Customizations can be carried out as per specific drawings.', 2),
        ('Parallel inner bush ribs for mounting din channel with self-tapping screw.', 3),
        ('Embedded M8 Nut for easy outside mounting without tampering enclosure and IP Rating.', 4),
        ('Stainless Steel Mounting Clamps/Polycarbonate Mounting Clamps with hardware (SS304)', 5),
        ('Available with Transparent cover (Optional).', 6)
) AS feature(text, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM product_features pf
    WHERE pf.product_id = p.id
);

-- =====================================================
-- VERIFY THE INSERTS
-- =====================================================

SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Dynamic Specs', COUNT(*) FROM product_dynamic_specs
UNION ALL
SELECT 'Features', COUNT(*) FROM product_features;
