-- Migration: 001_create_extensions.sql
-- Description: Enable required PostgreSQL extensions
-- Created: 2024

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable trigram search for fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable case-insensitive text type
CREATE EXTENSION IF NOT EXISTS citext;

-- Create custom ENUM types for the application

-- Admin user roles
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'viewer');

-- Quote request status workflow
CREATE TYPE quote_status AS ENUM (
    'pending',      -- New request, not yet reviewed
    'reviewed',     -- Admin has reviewed the request
    'quoted',       -- Quote has been sent to customer
    'accepted',     -- Customer accepted the quote
    'rejected',     -- Customer rejected the quote
    'expired'       -- Quote validity period has passed
);

-- General inquiry status
CREATE TYPE inquiry_status AS ENUM ('new', 'read', 'replied', 'closed');

-- Inquiry types
CREATE TYPE inquiry_type AS ENUM ('general', 'support', 'partnership', 'other');

-- Document types for product documents
CREATE TYPE document_type AS ENUM ('datasheet', 'manual', 'certificate', 'cad', 'other');

-- Audit log action types
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete');
