-- Migration: 009_create_indexes.sql
-- Description: Additional performance indexes and database optimizations
-- Dependencies: All previous migrations

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Products listing with category filter (common query)
CREATE INDEX idx_products_category_active_featured
    ON products(category_id, is_active, is_featured);

-- Products ordered by creation date (for admin listing)
CREATE INDEX idx_products_created_desc
    ON products(created_at DESC)
    WHERE is_active = TRUE;

-- Quote requests dashboard (pending quotes)
CREATE INDEX idx_quote_requests_pending_created
    ON quote_requests(created_at DESC)
    WHERE status = 'pending';

-- Quote requests by status and date
CREATE INDEX idx_quote_requests_status_date
    ON quote_requests(status, created_at DESC);

-- Low stock variants alert
CREATE INDEX idx_variants_low_stock
    ON product_variants(product_id, stock_quantity)
    WHERE stock_quantity <= low_stock_threshold AND is_active = TRUE;

-- ============================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================

-- Product search index (already created in 004, this adds more fields)
-- Enhanced product search with weighted columns
CREATE INDEX idx_products_fulltext_search
    ON products USING gin(
        to_tsvector('english',
            COALESCE(name, '') || ' ' ||
            COALESCE(code, '') || ' ' ||
            COALESCE(description, '') || ' ' ||
            COALESCE(spec_material, '')
        )
    );

-- Category search
CREATE INDEX idx_categories_fulltext_search
    ON categories USING gin(
        to_tsvector('english',
            COALESCE(name, '') || ' ' ||
            COALESCE(description, '')
        )
    );

-- ============================================
-- STATISTICS VIEWS (for dashboard)
-- ============================================

-- View: Dashboard statistics
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as total_products,
    (SELECT COUNT(*) FROM products WHERE is_featured = TRUE AND is_active = TRUE) as featured_products,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM product_variants WHERE is_active = TRUE) as total_variants,
    (SELECT COUNT(*) FROM product_variants
        WHERE stock_quantity <= low_stock_threshold AND is_active = TRUE) as low_stock_variants,
    (SELECT COUNT(*) FROM quote_requests WHERE status = 'pending') as pending_quotes,
    (SELECT COUNT(*) FROM quote_requests
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as quotes_this_month,
    (SELECT COUNT(*) FROM inquiries WHERE status = 'new') as new_inquiries;

-- View: Products with category info (common join)
CREATE OR REPLACE VIEW v_products_with_category AS
SELECT
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = TRUE) as variant_count,
    (SELECT SUM(pv.stock_quantity) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = TRUE) as total_stock,
    (SELECT pi.image_url FROM product_images pi
        WHERE pi.product_id = p.id AND pi.is_primary = TRUE AND pi.variant_id IS NULL
        LIMIT 1) as primary_image
FROM products p
JOIN categories c ON p.category_id = c.id;

-- View: Quote requests with item count
CREATE OR REPLACE VIEW v_quote_requests_summary AS
SELECT
    qr.*,
    COUNT(qri.id) as item_count,
    SUM(qri.quantity) as total_quantity,
    au.name as assigned_admin_name
FROM quote_requests qr
LEFT JOIN quote_request_items qri ON qr.id = qri.quote_request_id
LEFT JOIN admin_users au ON qr.assigned_admin_id = au.id
GROUP BY qr.id, au.name;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get product with all related data
CREATE OR REPLACE FUNCTION get_product_full(p_slug VARCHAR)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'product', row_to_json(p),
        'category', row_to_json(c),
        'variants', (
            SELECT json_agg(row_to_json(pv) ORDER BY pv.sort_order)
            FROM product_variants pv
            WHERE pv.product_id = p.id AND pv.is_active = TRUE
        ),
        'images', (
            SELECT json_agg(row_to_json(pi) ORDER BY pi.sort_order)
            FROM product_images pi
            WHERE pi.product_id = p.id
        ),
        'documents', (
            SELECT json_agg(row_to_json(pd))
            FROM product_documents pd
            WHERE pd.product_id = p.id
        ),
        'features', (
            SELECT json_agg(pf.feature_text ORDER BY pf.sort_order)
            FROM product_features pf
            WHERE pf.product_id = p.id
        ),
        'dynamic_specs', (
            SELECT json_object_agg(pds.spec_key, pds.spec_value)
            FROM product_dynamic_specs pds
            WHERE pds.product_id = p.id
        )
    ) INTO result
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.slug = p_slug AND p.is_active = TRUE;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to search products
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT,
    category_slug VARCHAR DEFAULT NULL,
    in_stock_only BOOLEAN DEFAULT FALSE,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    code VARCHAR,
    description TEXT,
    category_name VARCHAR,
    primary_image VARCHAR,
    is_featured BOOLEAN,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.slug,
        p.code,
        p.description,
        c.name as category_name,
        (SELECT pi.image_url FROM product_images pi
            WHERE pi.product_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image,
        p.is_featured,
        similarity(p.name || ' ' || COALESCE(p.code, ''), search_query) as relevance
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = TRUE
        AND (search_query IS NULL OR search_query = '' OR
            p.name ILIKE '%' || search_query || '%' OR
            p.code ILIKE '%' || search_query || '%' OR
            p.description ILIKE '%' || search_query || '%')
        AND (category_slug IS NULL OR c.slug = category_slug)
        AND (NOT in_stock_only OR EXISTS (
            SELECT 1 FROM product_variants pv
            WHERE pv.product_id = p.id AND pv.stock_quantity > 0
        ))
    ORDER BY relevance DESC, p.is_featured DESC, p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON VIEW v_dashboard_stats IS 'Aggregated statistics for admin dashboard';
COMMENT ON VIEW v_products_with_category IS 'Products joined with category info and computed fields';
COMMENT ON FUNCTION get_product_full IS 'Get complete product data as JSON including all relations';
COMMENT ON FUNCTION search_products IS 'Search products with filters and pagination';
