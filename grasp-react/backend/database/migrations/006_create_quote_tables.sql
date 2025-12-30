-- Migration: 006_create_quote_tables.sql
-- Description: Create quote request system tables
-- Dependencies: 002_create_admin_tables.sql, 004_create_product_tables.sql

-- Quote Requests Table (RFQ - Request for Quote)
CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(20) NOT NULL UNIQUE,
    status quote_status NOT NULL DEFAULT 'pending',

    -- Customer information
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,

    -- Assignment and workflow
    assigned_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,

    -- Quote details (filled when status = 'quoted')
    quoted_at TIMESTAMPTZ,
    quote_valid_until DATE,
    total_quoted_amount DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'INR',

    -- Internal notes (not visible to customer)
    internal_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quote Request Items (products requested in the quote)
CREATE TABLE quote_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,

    -- Quoted pricing (filled when quote is provided)
    quoted_unit_price DECIMAL(12, 2),
    quoted_total DECIMAL(12, 2),

    -- Notes specific to this line item
    notes TEXT,

    -- Constraints
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Quote Status History (audit trail for status changes)
CREATE TABLE quote_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
    old_status quote_status,
    new_status quote_status NOT NULL,
    changed_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence for generating quote request numbers
CREATE SEQUENCE quote_request_number_seq START 1;

-- Function to generate quote request number
CREATE OR REPLACE FUNCTION generate_quote_request_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.request_number := 'QR-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                          LPAD(nextval('quote_request_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate request number
CREATE TRIGGER set_quote_request_number
    BEFORE INSERT ON quote_requests
    FOR EACH ROW
    WHEN (NEW.request_number IS NULL)
    EXECUTE FUNCTION generate_quote_request_number();

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_quote_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO quote_status_history (quote_request_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_quote_status_changes
    AFTER UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_quote_status_change();

-- Trigger for updated_at
CREATE TRIGGER update_quote_requests_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_number ON quote_requests(request_number);
CREATE INDEX idx_quote_requests_email ON quote_requests(email);
CREATE INDEX idx_quote_requests_assigned ON quote_requests(assigned_admin_id) WHERE assigned_admin_id IS NOT NULL;
CREATE INDEX idx_quote_requests_created ON quote_requests(created_at DESC);
CREATE INDEX idx_quote_request_items_quote ON quote_request_items(quote_request_id);
CREATE INDEX idx_quote_request_items_product ON quote_request_items(product_id);
CREATE INDEX idx_quote_status_history_quote ON quote_status_history(quote_request_id);

-- Comments
COMMENT ON TABLE quote_requests IS 'Customer requests for product quotations (RFQ)';
COMMENT ON TABLE quote_request_items IS 'Products and quantities in a quote request';
COMMENT ON TABLE quote_status_history IS 'Audit trail of quote status changes';
COMMENT ON COLUMN quote_requests.request_number IS 'Human-readable unique identifier, e.g., QR-2024-00001';
COMMENT ON COLUMN quote_requests.quote_valid_until IS 'Date until which the quoted prices are valid';
