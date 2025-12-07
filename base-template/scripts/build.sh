#!/bin/bash

# NEO_STACK Base Template - Production Build
# This script builds the project for production

set -e

echo "🏗️  Building NEO_STACK for production..."
echo ""

# Clean previous build
if [ -d ".output" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf .output
fi

if [ -d ".nuxt" ]; then
    echo "🧹 Cleaning .nuxt directory..."
    rm -rf .nuxt
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Run 'npm install' first."
    exit 1
fi

# Run linter
echo "🔍 Running linter..."
npm run lint

# Run type check
echo "🔍 Running TypeScript check..."
npm run type-check

# Build project
echo "🔨 Building project..."
npm run build

# Success message
echo ""
echo "✅ Build completed successfully!"
echo ""
echo "Output directory: .output"
echo ""
echo "To preview the build:"
echo "  npm run preview"
echo ""
echo "To deploy:"
echo "  npm run start"
echo ""
