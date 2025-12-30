-- Migration: 008_create_system_tables.sql
-- Description: Create settings and audit log tables
-- Dependencies: 002_create_admin_tables.sql

-- Application Settings (key-value store)
CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description VARCHAR(500),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Audit Log (track admin actions for security and debugging)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email VARCHAR(255),  -- Preserved even if user is deleted
    action audit_action NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for settings updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_audit_log_admin ON audit_log(admin_user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Partition audit_log by month for better performance (optional, for high-volume systems)
-- This is a comment for future consideration:
-- ALTER TABLE audit_log PARTITION BY RANGE (created_at);

-- Comments
COMMENT ON TABLE settings IS 'Application configuration key-value store';
COMMENT ON TABLE audit_log IS 'Audit trail of administrative actions';
COMMENT ON COLUMN settings.is_public IS 'If true, setting can be exposed to public API';
COMMENT ON COLUMN audit_log.admin_email IS 'Preserved email even if admin user is deleted';
