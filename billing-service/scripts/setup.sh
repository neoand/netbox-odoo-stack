#!/bin/bash
# Setup script for Billing Service - NEO_STACK Platform v3.0

set -e

echo "💳 Setting up Billing Service for NEO_STACK Platform v3.0"
echo "=========================================================="

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

    if ! command -v pip3 &> /dev/null; then
        log_error "pip3 is not installed"
        exit 1
    fi

    log_success "All dependencies are installed"
}

# Create directories
create_directories() {
    log_info "Creating directories..."

    mkdir -p data/{postgres,redis,prometheus,grafana,invoices,usage}
    mkdir -p logs/{api,worker,nginx}
    mkdir -p config/{nginx/conf.d,prometheus,grafana/{dashboards,datasources},templates}
    mkdir -p docs/{pt,es}

    chmod 755 data/{postgres,redis,prometheus,grafana}
    chmod 755 logs/{api,worker,nginx}

    log_success "Directories created"
}

# Generate configuration files
generate_configs() {
    log_info "Generating configuration files..."

    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
POSTGRES_PASSWORD=billing_secure_password_change_me
POSTGRES_PORT=5433

# Redis Configuration
REDIS_PASSWORD=billing_redis_password_change_me
REDIS_PORT=6380

# Stripe Configuration
STRIPE_API_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Platform Configuration
PLATFORM_TENANT_ID=default
BILLING_CURRENCY=usd
BILLING_SECRET_KEY=your-secret-key-change-in-production
BILLING_ENCRYPTION_KEY=your-encryption-key-change-in-production

# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=billing@platform.local
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=billing@platform.local

# Logging
LOG_LEVEL=info

# External Services
NETBOX_API_URL=https://netbox.example.com
NETBOX_API_TOKEN=your_netbox_token
ODOO_API_URL=https://odoo.example.com
ODOO_API_KEY=your_odoo_api_key

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin_change_me

# Prometheus
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_BURST=20
EOF
        log_success "Generated .env file with configuration"
    else
        log_warning ".env file already exists, skipping generation"
    fi

    # Create Nginx configuration
    cat > config/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    sendfile on;
    keepalive_timeout 65;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=webhook:10m rate=5r/s;

    upstream billing_api {
        server api:8000;
    }

    upstream billing_webhook {
        server webhook-handler:8001;
    }

    server {
        listen 80;
        server_name billing.local;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://billing_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Webhook routes
        location /webhooks/ {
            limit_req zone=webhook burst=10 nodelay;

            proxy_pass http://billing_webhook;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://billing_api/health;
        }

        # Metrics
        location /metrics {
            proxy_pass http://billing_api/metrics;
        }
    }

    # HTTPS server (uncomment and configure for production)
    # server {
    #     listen 443 ssl http2;
    #     server_name billing.local;
    #
    #     ssl_certificate /etc/nginx/certs/billing.crt;
    #     ssl_certificate_key /etc/nginx/certs/billing.key;
    #
    #     # SSL configuration
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #     ssl_prefer_server_ciphers on;
    #
    #     # Same location blocks as above
    # }
}
EOF

    # Create Prometheus configuration
    cat > config/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "alert_rules.yml"

scrape_configs:
  - job_name: 'billing-api'
    static_configs:
      - targets: ['api:9090']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'billing-worker'
    static_configs:
      - targets: ['worker:9090']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
EOF

    # Create Grafana datasource configuration
    mkdir -p config/grafana/datasources
    cat > config/grafana/datasources/datasource.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    # Create Grafana dashboard provisioning
    mkdir -p config/grafana/dashboards
    cat > config/grafana/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'Billing Dashboards'
    orgId: 1
    folder: 'Billing'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

    log_success "Configuration files generated"
}

# Install Python dependencies
install_dependencies() {
    log_info "Installing Python dependencies..."

    cd api

    # Create requirements.txt
    cat > requirements.txt << 'EOF'
# Web framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Database
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.23
alembic==1.13.1

# Redis
redis[hiredis]==5.0.1

# Stripe
stripe==7.8.0

# HTTP client
aiohttp==3.9.1
httpx==0.25.2

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Data validation
pydantic==2.5.0
email-validator==2.1.0

# Metrics
prometheus-client==0.19.0

# Utilities
python-dotenv==1.0.0
click==8.1.7
rich==13.7.0

# Template engine
jinja2==3.1.2

# PDF generation
pdfkit==1.0.0
weasyprint==60.2

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2

# Development
black==23.11.0
isort==5.12.0
mypy==1.7.1
EOF

    pip3 install -r requirements.txt

    cd ..

    log_success "Python dependencies installed"
}

# Start services
start_services() {
    log_info "Starting billing services..."

    cd docker

    # Pull latest images
    docker-compose pull

    # Start database first
    log_info "Starting PostgreSQL..."
    docker-compose up -d postgres

    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL to be ready..."
    timeout 30 bash -c 'until docker-compose exec -T postgres pg_isready -U billing_user -d billing > /dev/null 2>&1; do sleep 2; done' || {
        log_error "PostgreSQL failed to start"
        exit 1
    }

    # Start Redis
    log_info "Starting Redis..."
    docker-compose up -d redis

    # Wait for Redis
    sleep 5

    # Start API
    log_info "Starting Billing API..."
    docker-compose up -d api

    # Start worker
    log_info "Starting Billing Worker..."
    docker-compose up -d worker

    # Start supporting services
    log_info "Starting supporting services..."
    docker-compose up -d invoice-generator
    docker-compose up -d usage-tracker
    docker-compose up -d webhook-handler

    # Start monitoring
    log_info "Starting monitoring services..."
    docker-compose up -d prometheus
    docker-compose up -d grafana
    docker-compose up -d redis-exporter
    docker-compose up -d postgres-exporter

    # Start Nginx
    log_info "Starting Nginx..."
    docker-compose up -d nginx

    cd ..

    log_success "All services started"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            log_success "Billing API is ready"
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
    if curl -s http://localhost:8000/health > /dev/null; then
        log_success "✅ Billing API is running on http://localhost:8000"
    else
        log_warning "⚠️  Billing API is not responding"
    fi

    # Check Prometheus
    if curl -s http://localhost:9091/-/ready > /dev/null; then
        log_success "✅ Prometheus is running on http://localhost:9091"
    else
        log_warning "⚠️  Prometheus is not responding"
    fi

    # Check Grafana
    if curl -s http://localhost:3001/api/health > /dev/null; then
        log_success "✅ Grafana is running on http://localhost:3001 (admin/admin)"
    else
        log_warning "⚠️  Grafana is not responding"
    fi

    # Check Nginx
    if curl -s http://localhost/health > /dev/null; then
        log_success "✅ Nginx is running on http://localhost"
    else
        log_warning "⚠️  Nginx is not responding"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "=========================================================="
    log_success "Billing Service setup completed!"
    echo "=========================================================="
    echo ""
    echo "🌐 Services:"
    echo "  • Billing API:         http://localhost:8000"
    echo "  • API Documentation:   http://localhost:8000/docs"
    echo "  • Prometheus:          http://localhost:9091"
    echo "  • Grafana:             http://localhost:3001 (admin/admin)"
    echo "  • Nginx (Proxy):       http://localhost"
    echo ""
    echo "💳 Billing Features:"
    echo "  • Subscription Management"
    echo "  • Invoice Generation"
    echo "  • Payment Processing"
    echo "  • Usage Tracking"
    echo "  • Multi-tenant Billing"
    echo "  • Stripe Integration"
    echo ""
    echo "📊 Monitoring:"
    echo "  • Dashboards:          http://localhost:3001"
    echo "  • Metrics:             http://localhost:8000/metrics"
    echo "  • Health Check:        http://localhost:8000/health"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • View logs:           docker-compose -f docker/docker-compose.yml logs -f"
    echo "  • Stop services:       docker-compose -f docker/docker-compose.yml down"
    echo "  • Restart:             docker-compose -f docker/docker-compose.yml restart"
    echo "  • API status:          curl http://localhost:8000/health"
    echo ""
    echo "📚 Documentation:"
    echo "  • API Docs:            http://localhost:8000/docs"
    echo "  • Stripe Setup:        https://stripe.com/docs"
    echo "  • Configuration:       .env file"
    echo ""
    echo "⚠️  Important:"
    echo "  1. Configure STRIPE_API_KEY in .env file"
    echo "  2. Set up Stripe webhooks to point to /api/v1/webhooks/stripe"
    echo "  3. Update SMTP configuration for email notifications"
    echo "  4. Change default passwords in .env file"
    echo ""
    log_success "Happy billing! 💳"
}

# Main execution
main() {
    log_info "Starting Billing Service setup..."

    check_dependencies
    create_directories
    generate_configs
    install_dependencies
    start_services
    wait_for_services
    verify_setup
    print_summary
}

# Run main function
main "$@"
