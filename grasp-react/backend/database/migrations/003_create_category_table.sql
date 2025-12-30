-- Migration: 003_create_category_table.sql
-- Description: Create product categories table
-- Dependencies: 001_create_extensions.sql

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50),
    description TEXT,
    image_url VARCHAR(500),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Category specifications (for quick display, e.g., "IP67", "UL94 V-0")
CREATE TABLE category_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    spec_value VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_featured ON categories(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_categories_sort ON categories(sort_order);
CREATE INDEX idx_category_specs_category ON category_specs(category_id);

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE categories IS 'Product categories for organizing the catalog';
COMMENT ON TABLE category_specs IS 'Quick specification badges shown on category cards';
COMMENT ON COLUMN categories.code IS 'Product series code, e.g., GE-PC Series';
