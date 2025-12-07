#!/bin/bash

# NEO_STACK - Tenant Portal Migration Script
# This script migrates tenant-portal to use the base-template

set -e

echo "🚀 Starting Tenant Portal migration to base-template..."
echo ""

# Check if base-template exists
if [ ! -d "base-template" ]; then
    echo "❌ base-template directory not found. Please ensure it exists."
    exit 1
fi

echo "✅ Base template found"

# Backup current tenant-portal
echo ""
echo "💾 Creating backup of current tenant-portal..."
BACKUP_DIR="tenant-portal-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✅ Backup created at: $BACKUP_DIR"

# Step 1: Update package.json
echo ""
echo "📦 Updating package.json..."
cp base-template/package.json ./
echo "✅ package.json updated"

# Step 2: Update nuxt.config.ts
echo ""
echo "⚙️  Updating nuxt.config.ts..."
cp base-template/nuxt.config.ts ./
echo "✅ nuxt.config.ts updated"

# Step 3: Update Tailwind config
echo ""
echo "🎨 Updating tailwind.config.js..."
cp base-template/tailwind.config.js ./
echo "✅ tailwind.config.js updated"

# Step 4: Update app.vue
echo ""
echo "📱 Updating app.vue..."
cp base-template/app.vue ./
echo "✅ app.vue updated"

# Step 5: Copy composables
echo ""
echo "🎣 Copying composables..."
rm -rf composables
cp -r base-template/composables ./
echo "✅ Composables updated"

# Step 6: Copy utils
echo ""
echo "🔧 Copying utils..."
rm -rf utils
cp -r base-template/utils ./
echo "✅ Utils updated"

# Step 7: Copy stores
echo ""
echo "📦 Copying stores..."
cp base-template/stores/auth.ts ./stores/
echo "✅ Stores updated"

# Step 8: Copy middleware
echo ""
echo "🔒 Copying middleware..."
cp base-template/middleware/auth.ts ./middleware/
echo "✅ Middleware updated"

# Step 9: Copy types
echo ""
echo "🏷️  Copying types..."
cp base-template/types/index.ts ./types/
echo "✅ Types updated"

# Step 10: Copy layouts
echo ""
echo "📐 Copying layouts..."
cp base-template/layouts/default.vue ./layouts/
cp base-template/layouts/auth.vue ./layouts/
cp base-template/layouts/blank.vue ./layouts/
echo "✅ Layouts updated"

# Step 11: Copy pages
echo ""
echo "📄 Copying pages..."
cp base-template/pages/index.vue ./pages/
cp -r base-template/pages/auth ./pages/
echo "✅ Pages updated"

# Step 12: Copy components
echo ""
echo "🧩 Copying components..."
cp -r base-template/components/ui ./components/
echo "✅ Components updated"

# Step 13: Copy assets
echo ""
echo "🎨 Copying assets..."
cp -r base-template/assets/css ./assets/
echo "✅ Assets updated"

# Step 14: Copy config files
echo ""
echo "⚙️  Copying config files..."
cp base-template/.eslintrc.cjs ./
cp base-template/tsconfig.json ./
echo "✅ Config files updated"

# Step 15: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Success message
echo ""
echo "🎉 Tenant Portal migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review and test the application"
echo "2. Update any custom code that may have been overwritten"
echo "3. Run 'npm run dev' to start development server"
echo "4. Check for any TypeScript errors: 'npm run type-check'"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
