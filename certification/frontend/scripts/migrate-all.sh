#!/bin/bash

# NEO_STACK - Migrate All Portals Script
# This script migrates all portals to use the base-template

set -e

echo "🚀 Starting migration of ALL portals to base-template..."
echo ""

# Check if base-template exists
if [ ! -d "base-template" ]; then
    echo "❌ base-template directory not found. Please ensure it exists."
    exit 1
fi

echo "✅ Base template found"
echo ""

# Function to migrate a portal
migrate_portal() {
    local portal_name=$1
    local portal_dir=$2

    echo "═══════════════════════════════════════════════════════════"
    echo "🔄 Migrating $portal_name..."
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    if [ ! -d "$portal_dir" ]; then
        echo "⚠️  $portal_name not found at $portal_dir, skipping..."
        echo ""
        return
    fi

    cd "$portal_dir"

    # Run migration script
    if [ -f "scripts/migrate-${portal_name,,}.sh" ]; then
        chmod +x "scripts/migrate-${portal_name,,}.sh"
        ./scripts/migrate-${portal_name,,}.sh
    else
        echo "❌ Migration script not found for $portal_name"
    fi

    cd ..
    echo ""
    echo "✅ $portal_name migration completed!"
    echo ""
}

# Migrate all portals
echo "This will migrate the following portals:"
echo "1. Admin Portal"
echo "2. Tenant Portal"
echo "3. Certification Frontend"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting migrations..."
    echo ""

    # Migrate Admin Portal
    migrate_portal "Admin Portal" "admin-portal"

    # Migrate Tenant Portal
    migrate_portal "Tenant Portal" "tenant-portal"

    # Migrate Certification Frontend
    migrate_portal "Certification" "certification/frontend"

    echo "═══════════════════════════════════════════════════════════"
    echo "🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "Summary:"
    echo "✅ Admin Portal - migrated"
    echo "✅ Tenant Portal - migrated"
    echo "✅ Certification Frontend - migrated"
    echo ""
    echo "Next steps:"
    echo "1. Test each portal individually"
    echo "2. Review any custom code that may have been overwritten"
    echo "3. Run 'npm run dev' in each portal directory"
    echo "4. Check for TypeScript errors: 'npm run type-check'"
    echo ""
    echo "Backup locations:"
    echo "- admin-portal-backup-*"
    echo "- tenant-portal-backup-*"
    echo "- certification-frontend-backup-*"
    echo ""
else
    echo "Migration cancelled."
    exit 0
fi
