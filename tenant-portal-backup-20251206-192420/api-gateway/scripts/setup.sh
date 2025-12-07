#!/bin/bash
# Setup script for Kong API Gateway

set -e

echo "🚀 Setting up Kong API Gateway for NEO_STACK Platform v3.0"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker/docker-compose.yml"
KONG_CONFIG="config/declarative/kong.yml"
PROJECT_NAME="neo-stack-api-gateway"

# Functions
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

# Create necessary directories
create_directories() {
    log_info "Creating directories..."

    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/prometheus
    mkdir -p data/grafana

    chmod 755 data/postgres
    chmod 755 data/redis

    log_success "Directories created"
}

# Generate JWT secrets
generate_secrets() {
    log_info "Generating JWT secrets..."

    if [ ! -f .env ]; then
        cat > .env << EOF
# JWT Secrets (generate new ones for production!)
ADMIN_JWT_SECRET=$(openssl rand -base64 32)
TENANT_ADMIN_JWT_SECRET=$(openssl rand -base64 32)
TENANT_USER_JWT_SECRET=$(openssl rand -base64 32)

# Database
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# Grafana
GRAFANA_ADMIN_PASSWORD=admin

# Kong
KONG_JWT_SECRET=$(openssl rand -base64 32)
EOF
        log_success "Generated .env file with secrets"
    else
        log_warning ".env file already exists, skipping generation"
    fi
}

# Build custom plugins
build_plugins() {
    log_info "Building custom Kong plugins..."

    # Check if we need to build a custom Kong image with plugins
    if [ ! -f plugins/tenant-context/handler.lua ]; then
        log_error "Plugin files not found"
        exit 1
    fi

    log_success "Plugins found"
}

# Start services
start_services() {
    log_info "Starting services with Docker Compose..."

    cd docker

    # Pull latest images
    docker-compose pull

    # Start database first
    log_info "Starting PostgreSQL..."
    docker-compose up -d kong-database

    # Wait for database to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    timeout 30 bash -c 'until docker-compose exec -T kong-database pg_isready -U kong; do sleep 2; done' || {
        log_error "PostgreSQL failed to start"
        exit 1
    }

    # Run migrations
    log_info "Running Kong migrations..."
    docker-compose up -d kong-migrations

    # Wait for migrations to complete
    sleep 5

    # Start all services
    log_info "Starting all services..."
    docker-compose up -d

    cd ..

    log_success "Services started"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            log_success "Kong Gateway is healthy"
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

# Load Kong configuration
load_configuration() {
    log_info "Loading Kong configuration..."

    # Use Kong Admin API to load declarative configuration
    curl -X POST http://localhost:8001/config \
        -F "config=@${KONG_CONFIG}" \
        -H "Content-Type: multipart/form-data" || {
        log_warning "Configuration might already be loaded or Kong is not ready yet"
    }

    log_success "Configuration loaded"
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."

    # Check Kong Gateway
    if curl -s http://localhost:8000/health > /dev/null; then
        log_success "✅ Kong Gateway is running on http://localhost:8000"
    else
        log_error "❌ Kong Gateway is not responding"
    fi

    # Check Kong Admin API
    if curl -s http://localhost:8001 > /dev/null; then
        log_success "✅ Kong Admin API is running on http://localhost:8001"
    else
        log_error "❌ Kong Admin API is not responding"
    fi

    # Check Konga Dashboard
    if curl -s http://localhost:8002 > /dev/null; then
        log_success "✅ Konga Dashboard is running on http://localhost:8002"
    else
        log_warning "⚠️  Konga Dashboard is not responding"
    fi

    # Check Prometheus
    if curl -s http://localhost:9090/-/healthy > /dev/null; then
        log_success "✅ Prometheus is running on http://localhost:9090"
    else
        log_warning "⚠️  Prometheus is not responding"
    fi

    # Check Grafana
    if curl -s http://localhost:3000/api/health > /dev/null; then
        log_success "✅ Grafana is running on http://localhost:3000 (admin/admin)"
    else
        log_warning "⚠️  Grafana is not responding"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "=========================================================="
    log_success "Kong API Gateway setup completed!"
    echo "=========================================================="
    echo ""
    echo "🌐 Services:"
    echo "  • Kong Gateway:       http://localhost:8000"
    echo "  • Kong Admin API:     http://localhost:8001"
    echo "  • Konga Dashboard:    http://localhost:8002"
    echo "  • Prometheus:         http://localhost:9090"
    echo "  • Grafana:            http://localhost:3000 (admin/admin)"
    echo ""
    echo "📚 Documentation:"
    echo "  • README:             platform/api-gateway/README.md"
    echo "  • Configuration:      platform/api-gateway/config/declarative/kong.yml"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • View logs:          docker-compose -f docker/docker-compose.yml logs -f"
    echo "  • Stop services:      docker-compose -f docker/docker-compose.yml down"
    echo "  • Restart:            docker-compose -f docker/docker-compose.yml restart"
    echo ""
    echo "📊 Metrics:"
    echo "  • Kong metrics:       http://localhost:8001/metrics"
    echo "  • Prometheus targets: http://localhost:9090/targets"
    echo ""
    log_success "Happy coding! 🚀"
}

# Main execution
main() {
    log_info "Starting Kong API Gateway setup..."

    check_dependencies
    create_directories
    generate_secrets
    build_plugins
    start_services
    wait_for_services
    load_configuration
    verify_setup
    print_summary
}

# Run main function
main "$@"
