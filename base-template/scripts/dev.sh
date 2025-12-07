#!/bin/bash

# NEO_STACK Base Template - Development Server
# This script starts the development server

set -e

echo "🚀 Starting NEO_STACK development server..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Run 'npm install' first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
fi

echo "🌐 Development server will be available at:"
echo "   http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start dev server
npm run dev
