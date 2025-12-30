-- Migration: 007_create_inquiry_table.sql
-- Description: Create general inquiries table (non-product specific contact)
-- Dependencies: 002_create_admin_tables.sql

CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_type inquiry_type NOT NULL DEFAULT 'general',

    -- Contact information
    company_name VARCHAR(200),
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),

    -- Inquiry content
    subject VARCHAR(200),
    message TEXT NOT NULL,

    -- Workflow
    status inquiry_status NOT NULL DEFAULT 'new',
    assigned_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,

    -- Internal notes
    internal_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_type ON inquiries(inquiry_type);
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_assigned ON inquiries(assigned_admin_id) WHERE assigned_admin_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE inquiries IS 'General contact form submissions not related to specific products';
COMMENT ON COLUMN inquiries.inquiry_type IS 'Category of inquiry: general, support, partnership, other';
