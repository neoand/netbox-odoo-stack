#!/bin/bash

# NEO_STACK Base Template - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up NEO_STACK Base Template..."
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm/pnpm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    echo "✅ pnpm detected"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
    echo "✅ yarn detected"
else
    PACKAGE_MANAGER="npm"
    echo "✅ npm detected"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies with $PACKAGE_MANAGER..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm install
elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn install
else
    npm install
fi

# Copy environment file
if [ ! -f .env ]; then
    echo ""
    echo "📄 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created from .env.example"
    echo "⚠️  Please update .env with your configuration"
else
    echo ""
    echo "✅ .env file already exists"
fi

# Make scripts executable
chmod +x scripts/*.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run 'npm run dev' to start development server"
echo ""
echo "Available commands:"
echo "  npm run dev         - Start development server"
echo "  npm run build       - Build for production"
echo "  npm run preview     - Preview production build"
echo "  npm run lint        - Run ESLint"
echo "  npm run type-check  - Run TypeScript check"
echo ""
