#!/bin/bash
# Setup script for NEO_STACK Certification Platform

set -e

echo "🎓 Setting up NEO_STACK Certification Platform"
echo "=============================================="

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

    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    log_success "All dependencies are installed"
}

# Generate environment file
generate_env() {
    log_info "Generating environment configuration..."

    if [ ! -f .env ]; then
        cat > .env << EOF
# ===========================================
# NEO_STACK Certification Platform
# ===========================================

# Environment
ENVIRONMENT=development
NODE_ENV=development

# Database
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Security
JWT_SECRET_KEY=$(openssl rand -base64 48)
SESSION_SECRET=$(openssl rand -base64 48)

# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3004,http://localhost:8080

# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=$(openssl rand -base64 12)

# Email Configuration (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_USE_TLS=true

# Certificate Generation
PUBLIC_CERTIFICATE_URL=http://localhost:8000

# Logging
LOG_LEVEL=info
EOF
        log_success "Generated .env file with secure random passwords"
    else
        log_warning ".env file already exists, skipping generation"
    fi
}

# Create required directories
create_directories() {
    log_info "Creating required directories..."

    mkdir -p storage/certificates
    mkdir -p storage/templates
    mkdir -p logs/nginx
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/provisioning
    mkdir -p monitoring/grafana/provisioning/datasources
    mkdir -p monitoring/grafana/provisioning/dashboards

    log_success "Directories created"
}

# Setup Grafana provisioning
setup_grafana() {
    log_info "Setting up Grafana..."

    cat > monitoring/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    log_success "Grafana provisioning configured"
}

# Build application
build_application() {
    log_info "Building applications..."

    # Build API
    log_info "Building FastAPI backend..."
    cd api
    python3 -m pip install -r requirements.txt
    python3 -m pip install -e .
    cd ..

    # Build frontend
    log_info "Building Vue 3 frontend..."
    cd frontend
    npm install
    npm run build
    cd ..

    log_success "Applications built"
}

# Start services
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

# Wait for services
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
            log_success "✅ Certification API is ready"
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

    # Check API
    if curl -s http://localhost:8000/api/health > /dev/null; then
        log_success "✅ API is running on http://localhost:8000"
    else
        log_warning "⚠️  API is not responding"
    fi

    # Check Frontend
    if curl -s http://localhost:3004 > /dev/null; then
        log_success "✅ Frontend is running on http://localhost:3004"
    else
        log_warning "⚠️  Frontend is not responding"
    fi

    # Check Nginx
    if curl -s http://localhost:8080 > /dev/null; then
        log_success "✅ Nginx is running on http://localhost:8080"
    else
        log_warning "⚠️  Nginx is not responding"
    fi

    # Check Grafana
    if curl -s http://localhost:3001 > /dev/null; then
        log_success "✅ Grafana is running on http://localhost:3001"
    else
        log_warning "⚠️  Grafana is not responding"
    fi

    # Check Prometheus
    if curl -s http://localhost:9090 > /dev/null; then
        log_success "✅ Prometheus is running on http://localhost:9090"
    else
        log_warning "⚠️  Prometheus is not responding"
    fi

    # Check Flower
    if curl -s http://localhost:5555 > /dev/null; then
        log_success "✅ Flower (Celery monitoring) is running on http://localhost:5555"
    else
        log_warning "⚠️  Flower is not responding"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "=============================================="
    log_success "Certification Platform setup completed!"
    echo "=============================================="
    echo ""
    echo "🌐 Services:"
    echo "  • Frontend (Vue 3):    http://localhost:3004"
    echo "  • Frontend (Proxy):    http://localhost:8080"
    echo "  • API (FastAPI):       http://localhost:8000"
    echo "  • API Docs:            http://localhost:8000/api/docs"
    echo ""
    echo "📊 Monitoring:"
    echo "  • Grafana:             http://localhost:3001 (admin/admin)"
    echo "  • Prometheus:          http://localhost:9090"
    echo "  • Flower:              http://localhost:5555"
    echo ""
    echo "💾 Database:"
    echo "  • PostgreSQL:          localhost:5433"
    echo "  • Redis:               localhost:6380"
    echo ""
    echo "🎓 Certification Platform Features:"
    echo "  • 4 certification levels (Fundamental → Master)"
    echo "  • 500+ questions across all levels"
    echo "  • Multiple question types (MCQ, Practical, Case Study)"
    echo "  • Certificate generation with verification"
    echo "  • Progress tracking and analytics"
    echo "  • Bilingual support (PT-BR + ES-MX)"
    echo ""
    echo "🔐 Default Credentials:"
    echo "  • Grafana: admin / (see .env file)"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • View logs:         docker-compose -f docker/docker-compose.yml logs -f"
    echo "  • Stop services:     docker-compose -f docker/docker-compose.yml down"
    echo "  • Restart:           docker-compose -f docker/docker-compose.yml restart"
    echo "  • Rebuild:           docker-compose -f docker/docker-compose.yml up -d --build"
    echo ""
    echo "📚 Documentation:"
    echo "  • Curriculum:        docs/pt/curriculo.md"
    echo "  • API Reference:     http://localhost:8000/api/docs"
    echo "  • Frontend Guide:    frontend/README.md"
    echo ""
    echo "⚠️  Important:"
    echo "  1. Update passwords in .env file for production"
    echo "  2. Configure SMTP for certificate emails"
    echo "  3. Set up SSL certificates for production"
    echo "  4. Review security settings before going live"
    echo ""
    log_success "Happy certifying! 🎓"
}

# Main execution
main() {
    log_info "Starting Certification Platform setup..."

    check_dependencies
    generate_env
    create_directories
    setup_grafana
    build_application
    start_services
    wait_for_services
    verify_setup
    print_summary
}

# Run main function
main "$@"
