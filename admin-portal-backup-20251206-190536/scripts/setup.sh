#!/bin/bash
# Setup script for Admin Portal - NEO_STACK Platform v3.0

set -e

echo "🖥️  Setting up Admin Portal for NEO_STACK Platform v3.0"
echo "========================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        log_info "Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version must be 18 or higher"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    log_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    npm install

    log_success "Dependencies installed"
}

# Generate configuration files
generate_configs() {
    log_info "Generating configuration files..."

    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
# API Configuration
API_BASE_URL=http://localhost:8000
AUTH_URL=http://localhost:8080
BILLING_URL=http://localhost:8000
NETBOX_URL=http://localhost:8001
ODOO_URL=http://localhost:8069

# Application Configuration
NODE_ENV=development
NUXT_PORT=3002

# Security
SESSION_SECRET=your-session-secret-change-me-in-production

# Docker Configuration
POSTGRES_PASSWORD=admin_secure_password_change_me
REDIS_PASSWORD=admin_redis_password_change_me

# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin_change_me

# Logging
LOG_LEVEL=info
EOF
        log_success "Generated .env file with configuration"
    else
        log_warning ".env file already exists, skipping generation"
    fi

    # Create public directory
    mkdir -p public

    # Create logs directory
    mkdir -p logs/nginx

    log_success "Configuration files generated"
}

# Build the application
build_app() {
    log_info "Building application..."

    npm run build

    log_success "Application built successfully"
}

# Start services with Docker
start_services() {
    log_info "Starting services with Docker..."

    cd docker

    # Pull latest images
    docker-compose pull

    # Build and start services
    docker-compose up -d --build

    cd ..

    log_success "Services started"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:3002 > /dev/null 2>&1; then
            log_success "Admin Portal is ready"
            break
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    if [ $attempt -eq $max_attempts ]; then
        log_error "Services failed to start within timeout"
        exit 1
    fi
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."

    # Check Admin Portal
    if curl -s http://localhost:3002 > /dev/null; then
        log_success "✅ Admin Portal is running on http://localhost:3002"
    else
        log_warning "⚠️  Admin Portal is not responding"
    fi

    # Check via Nginx
    if curl -s http://localhost > /dev/null; then
        log_success "✅ Nginx is running on http://localhost"
    else
        log_warning "⚠️  Nginx is not responding"
    fi

    # Check API proxy
    if curl -s http://localhost:3002/api/health > /dev/null; then
        log_success "✅ API proxy is working"
    else
        log_warning "⚠️  API proxy may not be configured yet"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "========================================================"
    log_success "Admin Portal setup completed!"
    echo "========================================================"
    echo ""
    echo "🌐 Services:"
    echo "  • Admin Portal:         http://localhost:3002"
    echo "  • Admin Portal (Proxy): http://localhost"
    echo "  • API Docs:             http://localhost:3002/docs"
    echo ""
    echo "🔐 Authentication:"
    echo "  • Default admin login available"
    echo "  • Demo credentials shown on login page"
    echo ""
    echo "🎨 Features:"
    echo "  • Dashboard with metrics"
    echo "  • Tenant management"
    echo "  • Billing management"
    echo "  • User management"
    echo "  • Plans & subscriptions"
    echo "  • Invoice management"
    echo "  • Analytics"
    echo ""
    echo "📊 Navigation:"
    echo "  • Dashboard:            http://localhost/"
    echo "  • Tenants:              http://localhost/tenants"
    echo "  • Billing:              http://localhost/billing"
    echo "  • Users:                http://localhost/users"
    echo "  • Settings:             http://localhost/settings"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • View logs:            docker-compose -f docker/docker-compose.yml logs -f"
    echo "  • Stop services:        docker-compose -f docker/docker-compose.yml down"
    echo "  • Restart:              docker-compose -f docker/docker-compose.yml restart"
    echo "  • Rebuild:              docker-compose -f docker/docker-compose.yml up -d --build"
    echo "  • Development mode:     npm run dev"
    echo ""
    echo "📚 Documentation:"
    echo "  • API Reference:        http://localhost:3002/docs"
    echo "  • Configuration:        .env file"
    echo "  • Nuxt Docs:            https://nuxt.com"
    echo ""
    echo "⚠️  Important:"
    echo "  1. Configure API_BASE_URL in .env file"
    echo "  2. Update SESSION_SECRET in .env file"
    echo "  3. Set up proper domain for production"
    echo "  4. Configure SSL certificates for production"
    echo ""
    log_success "Happy administrating! 🖥️"
}

# Main execution
main() {
    log_info "Starting Admin Portal setup..."

    check_dependencies
    install_dependencies
    generate_configs
    build_app
    start_services
    wait_for_services
    verify_setup
    print_summary
}

# Run main function
main "$@"
