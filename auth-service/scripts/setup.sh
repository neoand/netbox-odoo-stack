#!/bin/bash
# Setup script for Authentik Auth Service

set -e

echo "🔐 Setting up Authentik Auth Service for NEO_STACK Platform v3.0"
echo "================================================================="

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

# Create directories
create_directories() {
    log_info "Creating directories..."

    mkdir -p data/postgresql
    mkdir -p data/redis
    mkdir -p data/authentik/media
    mkdir -p data/authentik/custom
    mkdir -p logs
    mkdir -p nginx/ssl

    chmod 755 data/postgresql
    chmod 755 data/redis
    chmod 755 data/authentik/media
    chmod 755 data/authentik/custom

    log_success "Directories created"
}

# Generate secrets
generate_secrets() {
    log_info "Generating secrets and configuration..."

    if [ ! -f .env ]; then
        cat > .env << EOF
# Authentik Secret Key (generate new ones for production!)
AUTHENTIK_SECRET_KEY=$(openssl rand -base64 32)

# Email Configuration
AUTHENTIK_EMAIL_FROM="noreply@platform.local"
AUTHENTIK_EMAIL_HOST="smtp.example.com"
AUTHENTIK_EMAIL_PORT="587"
AUTHENTIK_EMAIL_USERNAME="noreply@platform.local"
AUTHENTIK_EMAIL_PASSWORD="email_password"
AUTHENTIK_EMAIL_USE_TLS="true"
AUTHENTIK_EMAIL_USE_SSL="false"

# Database
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# Grafana
GRAFANA_ADMIN_PASSWORD=admin
EOF
        log_success "Generated .env file with secrets"
    else
        log_warning ".env file already exists, skipping generation"
    fi
}

# Generate SSL certificates
generate_ssl_certificates() {
    log_info "Generating self-signed SSL certificates..."

    if [ ! -f nginx/ssl/server.crt ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/server.key \
            -out nginx/ssl/server.crt \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=platform.local"

        chmod 600 nginx/ssl/server.key
        chmod 644 nginx/ssl/server.crt

        log_success "Generated SSL certificates"
    else
        log_warning "SSL certificates already exist"
    fi
}

# Create tenant directories
create_tenant_directories() {
    log_info "Creating tenant directories..."

    mkdir -p tenants/tenant1/brand
    mkdir -p tenants/tenant1/policies
    mkdir -p tenants/tenant1/providers
    mkdir -p tenants/tenant2/brand
    mkdir -p tenants/tenant2/policies
    mkdir -p tenants/tenant2/providers

    log_success "Tenant directories created"
}

# Start services
start_services() {
    log_info "Starting Authentik services..."

    cd docker

    # Pull latest images
    docker-compose pull

    # Start database first
    log_info "Starting PostgreSQL..."
    docker-compose up -d postgresql

    # Wait for database to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    timeout 30 bash -c 'until docker-compose exec -T postgresql pg_isready -U authentik; do sleep 2; done' || {
        log_error "PostgreSQL failed to start"
        exit 1
    }

    # Start Redis
    log_info "Starting Redis..."
    docker-compose up -d redis

    # Wait for Redis
    log_info "Waiting for Redis..."
    sleep 5

    # Start Authentik server
    log_info "Starting Authentik Server..."
    docker-compose up -d authentik-server

    # Wait for server to initialize
    log_info "Waiting for Authentik Server to initialize..."
    timeout 60 bash -c 'until curl -s http://localhost:9000/-/health/ > /dev/null 2>&1; do sleep 5; done' || {
        log_error "Authentik Server failed to start"
        exit 1
    }

    # Start worker
    log_info "Starting Authentik Worker..."
    docker-compose up -d authentik-worker

    # Start proxy
    log_info "Starting Authentik Proxy..."
    docker-compose up -d authentik-proxy

    # Start monitoring
    log_info "Starting monitoring services..."
    docker-compose up -d postgres-exporter
    docker-compose up -d redis-exporter
    docker-compose up -d nginx

    cd ..

    log_success "All services started"
}

# Wait for services
wait_for_services() {
    log_info "Waiting for all services to be healthy..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:9000/-/health/ > /dev/null 2>&1; then
            log_success "Authentik Server is healthy"
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

# Bootstrap Authentik
bootstrap_authentik() {
    log_info "Bootstrapping Authentik..."

    # Wait for migrations to complete
    sleep 10

    # Check if admin user exists
    if ! curl -s http://localhost:9000/api/v3/core/applications/ > /dev/null 2>&1; then
        log_info "Running initial setup..."

        # The initial setup will be done via API or UI
        log_info "Please complete the initial setup via the UI at http://localhost:9000/if/flow/initial-setup/"
    else
        log_info "Authentik is already configured"
    fi
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."

    # Check Authentik Server
    if curl -s http://localhost:9000/-/health/ > /dev/null; then
        log_success "✅ Authentik Server is running on http://localhost:9000"
    else
        log_error "❌ Authentik Server is not responding"
    fi

    # Check Authentik Proxy
    if curl -s http://localhost:4180/-/health/ > /dev/null; then
        log_success "✅ Authentik Proxy is running on http://localhost:4180"
    else
        log_warning "⚠️  Authentik Proxy is not responding"
    fi

    # Check PostgreSQL
    if docker-compose -f docker/docker-compose.yml exec -T postgresql pg_isready -U authentik > /dev/null 2>&1; then
        log_success "✅ PostgreSQL is running"
    else
        log_error "❌ PostgreSQL is not running"
    fi

    # Check Redis
    if docker-compose -f docker/docker-compose.yml exec -T redis redis-cli -a redis_password ping > /dev/null 2>&1; then
        log_success "✅ Redis is running"
    else
        log_error "❌ Redis is not running"
    fi

    # Check Metrics
    if curl -s http://localhost:9001/metrics > /dev/null; then
        log_success "✅ Metrics endpoint is available on http://localhost:9001/metrics"
    else
        log_warning "⚠️  Metrics endpoint is not responding"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "================================================================="
    log_success "Authentik Auth Service setup completed!"
    echo "================================================================="
    echo ""
    echo "🌐 Services:"
    echo "  • Authentik Server:    http://localhost:9000"
    echo "  • Authentik Proxy:     http://localhost:4180"
    echo "  • Authentik Metrics:   http://localhost:9001/metrics"
    echo "  • Nginx (SSL):         https://localhost:9443"
    echo ""
    echo "🔧 Configuration:"
    echo "  • Admin UI:            http://localhost:9000/"
    echo "  • Initial Setup:       http://localhost:9000/if/flow/initial-setup/"
    echo "  • Config File:         config/authentik.yml"
    echo ""
    echo "📚 Documentation:"
    echo "  • README:              platform/auth-service/README.md"
    echo "  • Multi-tenant:        platform/auth-service/docs/multi-tenant.md"
    echo "  • API Docs:            platform/auth-service/docs/api.md"
    echo ""
    echo "🔑 Default Credentials:"
    echo "  • Username:            admin"
    echo "  • Password:            (set during initial setup)"
    echo ""
    echo "📊 Monitoring:"
    echo "  • PostgreSQL Exporter: http://localhost:9187"
    echo "  • Redis Exporter:      http://localhost:9121"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • View logs:           docker-compose -f docker/docker-compose.yml logs -f"
    echo "  • Stop services:       docker-compose -f docker/docker-compose.yml down"
    echo "  • Restart:             docker-compose -f docker/docker-compose.yml restart"
    echo "  • Create tenant:       ./scripts/create-tenant.sh tenant_name"
    echo ""
    log_success "Happy authenticating! 🔐"
}

# Main execution
main() {
    log_info "Starting Authentik Auth Service setup..."

    check_dependencies
    create_directories
    generate_secrets
    generate_ssl_certificates
    create_tenant_directories
    start_services
    wait_for_services
    bootstrap_authentik
    verify_setup
    print_summary
}

# Run main function
main "$@"
