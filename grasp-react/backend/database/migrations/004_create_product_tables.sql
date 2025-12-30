-- Migration: 004_create_product_tables.sql
-- Description: Create products, variants, specs, and features tables
-- Dependencies: 003_create_category_table.sql

-- Main Products Table (base product information)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    code VARCHAR(50),
    description TEXT,
    full_description TEXT,

    -- Fixed specification columns (common to all products)
    spec_material VARCHAR(100),
    spec_ip_rating VARCHAR(20),
    spec_flammability VARCHAR(50),
    spec_color VARCHAR(50),
    spec_door_type VARCHAR(100),
    spec_mounting VARCHAR(100),
    spec_temperature_range VARCHAR(50),

    -- Status flags
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Variants Table (size/dimension variations of a product)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,  -- e.g., "200 x 150 x 100 mm"

    -- Variant-specific specifications
    spec_dimensions VARCHAR(100),
    spec_weight VARCHAR(50),

    -- Inventory tracking
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dynamic Product Specifications (flexible key-value for additional specs)
CREATE TABLE product_dynamic_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    spec_key VARCHAR(100) NOT NULL,
    spec_value VARCHAR(500) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,

    -- Prevent duplicate keys per product
    CONSTRAINT unique_product_spec_key UNIQUE (product_id, spec_key)
);

-- Product Features (bullet points)
CREATE TABLE product_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    feature_text VARCHAR(500) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Indexes for products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_search ON products USING gin(
    (name || ' ' || COALESCE(description, '') || ' ' || COALESCE(code, '')) gin_trgm_ops
);

-- Indexes for variants
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_stock ON product_variants(stock_quantity)
    WHERE stock_quantity <= low_stock_threshold;

-- Indexes for specs and features
CREATE INDEX idx_product_dynamic_specs_product ON product_dynamic_specs(product_id);
CREATE INDEX idx_product_features_product ON product_features(product_id);

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE products IS 'Base product information, parent for variants';
COMMENT ON TABLE product_variants IS 'Size/dimension variants of a product with individual stock tracking';
COMMENT ON TABLE product_dynamic_specs IS 'Flexible key-value specifications for product-specific attributes';
COMMENT ON TABLE product_features IS 'Feature bullet points for product marketing';
COMMENT ON COLUMN products.spec_ip_rating IS 'Ingress Protection rating, e.g., IP67';
COMMENT ON COLUMN product_variants.sku IS 'Stock Keeping Unit - unique identifier for inventory';
