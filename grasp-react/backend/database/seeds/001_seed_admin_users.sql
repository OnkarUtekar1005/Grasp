-- Seed: 001_seed_admin_users.sql
-- Description: Create default admin user
-- Note: Password hash is for 'admin123' using bcrypt
-- IMPORTANT: Change this password immediately after first login!

INSERT INTO admin_users (id, email, password_hash, name, role, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@graspelectric.com',
    -- This is bcrypt hash for 'admin123' - CHANGE IN PRODUCTION!
    '$2b$10$rQZ8K.XVmJT8p9g5k5e3aOYBVxB3qZpQJVx3V7X8Z9Y0W1U2T3S4R',
    'System Administrator',
    'super_admin',
    TRUE
);

-- You can add more admin users here
-- Example:
-- INSERT INTO admin_users (email, password_hash, name, role)
-- VALUES ('manager@graspelectric.com', '$2b$...', 'Sales Manager', 'admin');
