-- Migration: 005_create_media_tables.sql
-- Description: Create product images and documents tables
-- Dependencies: 004_create_product_tables.sql

-- Product Images Table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Documents Table (datasheets, manuals, certificates)
CREATE TABLE product_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    document_type document_type NOT NULL DEFAULT 'other',
    file_size_bytes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_variant ON product_images(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_product_documents_product ON product_documents(product_id);
CREATE INDEX idx_product_documents_type ON product_documents(document_type);

-- Ensure only one primary image per product (via partial unique index)
CREATE UNIQUE INDEX idx_product_images_single_primary
    ON product_images(product_id)
    WHERE is_primary = TRUE AND variant_id IS NULL;

-- Comments
COMMENT ON TABLE product_images IS 'Product and variant images for gallery display';
COMMENT ON TABLE product_documents IS 'Downloadable documents like datasheets, manuals, CAD files';
COMMENT ON COLUMN product_images.variant_id IS 'If set, image is specific to this variant; NULL means it applies to base product';
COMMENT ON COLUMN product_images.is_primary IS 'Primary image shown in listings and as main product image';
