-- Seed: 007_seed_settings.sql
-- Description: Seed initial application settings

INSERT INTO settings (key, value, description, is_public) VALUES

-- Company Information
('company_name', 'GRASP Electric', 'Company display name', TRUE),
('company_tagline', 'Industrial Enclosure Solutions', 'Company tagline for marketing', TRUE),
('company_email', 'info@graspelectric.com', 'Primary contact email', TRUE),
('company_phone', '+91 XXXX XXXXXX', 'Primary contact phone', TRUE),
('company_address', 'Industrial Area, India', 'Company address', TRUE),

-- Quote Settings
('quote_validity_days', '30', 'Default number of days a quote remains valid', FALSE),
('quote_prefix', 'QR', 'Prefix for quote request numbers', FALSE),

-- Inventory Settings
('low_stock_alert_threshold', '10', 'Default threshold for low stock alerts', FALSE),
('enable_stock_notifications', 'true', 'Enable email notifications for low stock', FALSE),

-- Email Settings (placeholders - configure with actual values)
('smtp_host', '', 'SMTP server host', FALSE),
('smtp_port', '587', 'SMTP server port', FALSE),
('smtp_from_email', 'noreply@graspelectric.com', 'From email for system emails', FALSE),

-- Site Settings
('maintenance_mode', 'false', 'Enable maintenance mode', FALSE),
('enable_quote_requests', 'true', 'Allow customers to submit quote requests', TRUE),
('enable_inquiries', 'true', 'Allow customers to submit general inquiries', TRUE),

-- Currency
('default_currency', 'INR', 'Default currency code', TRUE),
('currency_symbol', '₹', 'Currency symbol for display', TRUE);

-- Product Documents (from mock data)
INSERT INTO product_documents (product_id, name, document_url, document_type) VALUES
('p0000000-0000-0000-0000-000000000101', 'Datasheet', '/docs/ge-pc-100-datasheet.pdf', 'datasheet'),
('p0000000-0000-0000-0000-000000000101', 'Installation Guide', '/docs/ge-pc-100-install.pdf', 'manual');

-- Dynamic Specs (additional specs not in fixed columns)
INSERT INTO product_dynamic_specs (product_id, spec_key, spec_value, sort_order) VALUES
-- Metal enclosure specific specs
('p0000000-0000-0000-0000-000000000201', 'Impact Rating', 'IK10', 1),
('p0000000-0000-0000-0000-000000000201', 'Sheet Thickness', '1.5mm', 2),

-- Junction box specific specs
('p0000000-0000-0000-0000-000000000301', 'Cable Entries', '8 x M20, 4 x M25', 1),

-- Terminal enclosure specific specs
('p0000000-0000-0000-0000-000000000401', 'Rail Size', '35mm DIN Rail', 1),

-- Hazardous area specific specs
('p0000000-0000-0000-0000-000000000501', 'Certification', 'ATEX II 2 GD, IECEx', 1),
('p0000000-0000-0000-0000-000000000501', 'Zone Rating', 'Zone 1, Zone 2, Zone 21, Zone 22', 2),

-- Custom service specific specs
('p0000000-0000-0000-0000-000000000601', 'Customization', 'Full Custom', 1),
('p0000000-0000-0000-0000-000000000601', 'Lead Time', '2-4 weeks', 2),
('p0000000-0000-0000-0000-000000000601', 'Minimum Order', '10 units', 3);
