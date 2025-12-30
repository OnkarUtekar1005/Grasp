# GRASP Electric - Database

PostgreSQL database schema and seed data for the GRASP Electric e-commerce platform.

## Prerequisites

- PostgreSQL 14+ installed
- `psql` command-line tool available
- Database created (see setup below)

## Database Setup

### 1. Create Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE grasp_electric;

# Exit
\q
```

### 2. Set Connection String

You can either:

**Option A:** Set environment variable:
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/grasp_electric"
```

**Option B:** Copy and edit `.env.example`:
```bash
cp ../.env.example ../.env
# Edit .env with your database credentials
```

**Option C:** Pass connection string directly to scripts

### 3. Run Migrations

```bash
cd scripts
chmod +x run_migrations.sh
./run_migrations.sh

# Or with explicit connection string:
./run_migrations.sh "postgresql://user:pass@localhost:5432/grasp_electric"
```

### 4. Seed Data (Optional)

```bash
chmod +x run_seeds.sh
./run_seeds.sh
```

## Directory Structure

```
database/
├── migrations/           # Schema migrations (run in order)
│   ├── 001_create_extensions.sql
│   ├── 002_create_admin_tables.sql
│   ├── 003_create_category_table.sql
│   ├── 004_create_product_tables.sql
│   ├── 005_create_media_tables.sql
│   ├── 006_create_quote_tables.sql
│   ├── 007_create_inquiry_table.sql
│   ├── 008_create_system_tables.sql
│   └── 009_create_indexes.sql
├── seeds/                # Sample data
│   ├── 001_seed_admin_users.sql
│   ├── 002_seed_categories.sql
│   ├── 003_seed_products.sql
│   ├── 004_seed_product_variants.sql
│   ├── 005_seed_product_images.sql
│   ├── 006_seed_product_features.sql
│   └── 007_seed_settings.sql
├── scripts/              # Helper scripts
│   ├── run_migrations.sh
│   └── run_seeds.sh
└── README.md
```

## Schema Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `admin_users` | Administrative users for the backend |
| `admin_sessions` | Active login sessions |
| `categories` | Product categories |
| `products` | Base product information |
| `product_variants` | Size/dimension variants with inventory |
| `product_dynamic_specs` | Flexible key-value specifications |
| `product_features` | Feature bullet points |
| `product_images` | Product and variant images |
| `product_documents` | Datasheets, manuals, etc. |
| `quote_requests` | Customer quote requests (RFQ) |
| `quote_request_items` | Products in a quote request |
| `quote_status_history` | Quote workflow audit trail |
| `inquiries` | General contact form submissions |
| `settings` | Application configuration |
| `audit_log` | Admin action audit trail |

### Views

| View | Description |
|------|-------------|
| `v_dashboard_stats` | Aggregated statistics for admin dashboard |
| `v_products_with_category` | Products with category info and computed fields |
| `v_quote_requests_summary` | Quote requests with item counts |

### Key Functions

| Function | Description |
|----------|-------------|
| `get_product_full(slug)` | Get complete product data as JSON |
| `search_products(query, ...)` | Search products with filters |

## Default Admin Account

After seeding, you can login with:
- **Email:** admin@graspelectric.com
- **Password:** admin123

**IMPORTANT:** Change this password immediately in production!

## Resetting the Database

To drop and recreate:

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS grasp_electric;"
psql -U postgres -c "CREATE DATABASE grasp_electric;"
./scripts/run_migrations.sh
./scripts/run_seeds.sh
```

## Production Considerations

1. **Change default admin password** before going live
2. **Configure proper backup strategy** for PostgreSQL
3. **Set up connection pooling** (e.g., PgBouncer) for high traffic
4. **Enable SSL** for database connections
5. **Review and adjust indexes** based on actual query patterns
6. **Set up monitoring** for slow queries and connection issues

## Connecting from Node.js

Example using `pg` package:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Query example
const result = await pool.query('SELECT * FROM products WHERE is_active = $1', [true]);
```

## Entity Relationship Diagram

```
admin_users ──┬──────────────────────────────────────┐
              │                                      │
              ▼                                      ▼
     quote_requests ◄─── quote_status_history    inquiries
              │
              ▼
     quote_request_items
              │
              ▼
    ┌─── products ───┬─────────────┬───────────────┐
    │         │      │             │               │
    ▼         ▼      ▼             ▼               ▼
categories  variants  images   documents   features/specs
```
