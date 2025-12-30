#!/bin/bash

# run_migrations.sh
# Runs all database migrations in order
# Usage: ./run_migrations.sh [database_url]

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/../migrations"

# Database connection
if [ -n "$1" ]; then
    DATABASE_URL="$1"
elif [ -n "$DATABASE_URL" ]; then
    DATABASE_URL="$DATABASE_URL"
else
    # Default local development connection
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grasp_electric"
fi

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  GRASP Electric - Database Migrations ${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "Database: ${GREEN}$DATABASE_URL${NC}"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database. Check your connection string.${NC}"
    exit 1
fi
echo -e "${GREEN}Connection successful!${NC}"
echo ""

# Run migrations in order
echo -e "${YELLOW}Running migrations...${NC}"
echo ""

for migration in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
    filename=$(basename "$migration")
    echo -e "  Running: ${GREEN}$filename${NC}"

    if psql "$DATABASE_URL" -f "$migration" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Success${NC}"
    else
        echo -e "  ${RED}✗ Failed${NC}"
        echo -e "${RED}Error running $filename. Aborting.${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All migrations completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
