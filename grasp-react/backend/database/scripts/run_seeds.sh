#!/bin/bash

# run_seeds.sh
# Runs all database seed files in order
# Usage: ./run_seeds.sh [database_url]

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEEDS_DIR="$SCRIPT_DIR/../seeds"

# Database connection
if [ -n "$1" ]; then
    DATABASE_URL="$1"
elif [ -n "$DATABASE_URL" ]; then
    DATABASE_URL="$DATABASE_URL"
else
    # Default local development connection
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grasp_electric"
fi

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}  GRASP Electric - Database Seeding ${NC}"
echo -e "${YELLOW}=====================================${NC}"
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

# Confirm seeding
echo -e "${YELLOW}WARNING: This will insert seed data into the database.${NC}"
echo -e "${YELLOW}If data already exists, you may encounter duplicate key errors.${NC}"
echo ""
read -p "Do you want to continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Running seed files...${NC}"
echo ""

for seed in $(ls "$SEEDS_DIR"/*.sql | sort); do
    filename=$(basename "$seed")
    echo -e "  Running: ${GREEN}$filename${NC}"

    if psql "$DATABASE_URL" -f "$seed" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Success${NC}"
    else
        echo -e "  ${YELLOW}⚠ Warning: Some records may already exist${NC}"
    fi
done

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Seeding completed!                 ${NC}"
echo -e "${GREEN}=====================================${NC}"
