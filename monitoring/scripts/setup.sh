#!/bin/bash
# Setup script for Monitoring Service (Prometheus + Grafana)

set -e

echo "📊 Setting up Monitoring Service for NEO_STACK Platform v3.0"
echo "============================================================"

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

    mkdir -p data/prometheus
    mkdir -p data/grafana
    mkdir -p data/alertmanager
    mkdir -p data/node-exporter
    mkdir -p data/cadvisor
    mkdir -p data/loki
    mkdir -p data/tempo
    mkdir -p data/elasticsearch
    mkdir -p logs

    # Set permissions
    chmod 755 data/prometheus
    chmod 755 data/grafana
    chmod 755 data/alertmanager

    log_success "Directories created"
}

# Generate configuration files
generate_configs() {
    log_info "Generating configuration files..."

    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
# SMTP Configuration
SMTP_PASSWORD=your_smtp_password

# Slack Configuration
SLACK_API_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CRITICAL_CHANNEL_WEBHOOK=https://hooks.slack.com/services/YOUR/CRITICAL/WEBHOOK
SLACK_WARNINGS_CHANNEL_WEBHOOK=https://hooks.slack.com/services/YOUR/WARNINGS/WEBHOOK
SLACK_DATABASE_CHANNEL_WEBHOOK=https://hooks.slack.com/services/YOUR/DATABASE/WEBHOOK
SLACK_SECURITY_CHANNEL_WEBHOOK=https://hooks.slack.com/services/YOUR/SECURITY/WEBHOOK
SLACK_BILLING_CHANNEL_WEBHOOK=https://hooks.slack.com/services/YOUR/BILLING/WEBHOOK
SLACK_INFRASTRUCTURE_CHANNEL_WEBHOOK=https://hooks.slack.com/services/YOUR/INFRASTRUCTURE/WEBHOOK

# PagerDuty Configuration
PAGERDUTY_CRITICAL_INTEGRATION_KEY=your_pagerduty_key

# VictorOps Configuration
VICTOROPS_API_KEY=your_victorops_api_key
VICTOROPS_SECURITY_ROUTING_KEY=your_victorops_routing_key

# Incident Management Webhook
INCIDENT_WEBHOOK_URL=https://api.incident.io/v1/alerts
INCIDENT_WEBHOOK_TOKEN=your_incident_token

# OAuth Configuration for Grafana
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_AUTH_URL=https://auth.platform.local/api/v3/oauth/authorize/
OAUTH_TOKEN_URL=https://auth.platform.local/api/v3/oauth/token/
OAUTH_API_URL=https://auth.platform.local/api/v3/oauth/userinfo/
EOF
        log_success "Generated .env file with configuration"
    else
        log_warning ".env file already exists, skipping generation"
    fi

    # Create blackbox exporter config
    cat > exporters/blackbox.yml << 'EOF'
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: [200, 201, 202]
      method: GET
      headers:
        Host: example.com
        Accept-Language: en-US
      no_follow_redirects: false
      fail_if_ssl: false
      fail_if_not_ssl: false

  http_post_2xx:
    prober: http
    timeout: 5s
    http:
      method: POST
      headers:
        Content-Type: application/json
      body: '{}'

  tcp_connect:
    prober: tcp
    timeout: 5s

  dns_udp:
    prober: dns
    timeout: 5s
    dns:
      query_name: "google.com"
      query_type: "A"
      valid_rcodes:
        - NOERROR
      validate_answer_rrs:
        fail_if_matches_regexp:
          - ".*127.0.0.1"
        fail_if_not_matches_regexp:
          - ".*google\.com.\t300\tIN\tA\t.*"
EOF

    # Create PostgreSQL queries config
    cat > exporters/postgres-queries.yaml << 'EOF'
pg_replication:
  query: "SELECT CASE WHEN NOT pg_is_in_recovery() THEN 0 ELSE GREATEST (0, EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))) END AS lag"
  master: true

pg_postmaster:
  query: "SELECT pg_postmaster_start_time as start_time_seconds from pg_postmaster_start_time()"
  master: true

pg_stat_user_tables:
  query: |
    SELECT
      current_database() datname,
      schemaname,
      relname,
      seq_scan,
      seq_tup_read,
      idx_scan,
      idx_tup_fetch,
      n_tup_ins,
      n_tup_upd,
      n_tup_del,
      n_tup_hot_upd,
      n_live_tup,
      n_dead_tup,
      n_mod_since_analyze,
      COALESCE(last_vacuum, '1970-01-01Z') as last_vacuum,
      COALESCE(last_autovacuum, '1970-01-01Z') as last_autovacuum,
      COALESCE(last_analyze, '1970-01-01Z') as last_analyze,
      COALESCE(last_autoanalyze, '1970-01-01Z') as last_autoanalyze,
      vacuum_count,
      autovacuum_count,
      analyze_count,
      autoanalyze_count
    FROM pg_stat_user_tables
  metrics:
    - datname:
        usage: "LABEL"
        description: "Name of the database to which this relation belongs"
    - schemaname:
        usage: "LABEL"
        description: "Name of the schema that this relation is in"
    - relname:
        usage: "LABEL"
        description: "Name of this relation"
    - seq_scan:
        usage: "COUNTER"
        description: "Number of sequential scans initiated on this table"
    - seq_tup_read:
        usage: "COUNTER"
        description: "Number of live rows fetched by sequential scans"
    - idx_scan:
        usage: "COUNTER"
        description: "Number of index scans initiated on this table"
    - idx_tup_fetch:
        usage: "COUNTER"
        description: "Number of live rows fetched by index scans"
    - n_tup_ins:
        usage: "COUNTER"
        description: "Number of rows inserted"
    - n_tup_upd:
        usage: "COUNTER"
        description: "Number of rows updated"
    - n_tup_del:
        usage: "COUNTER"
        description: "Number of rows deleted"
    - n_tup_hot_upd:
        usage: "COUNTER"
        description: "Number of rows HOT updated"
    - n_live_tup:
        usage: "GAUGE"
        description: "Estimated number of live rows"
    - n_dead_tup:
        usage: "GAUGE"
        description: "Estimated number of dead rows"
    - n_mod_since_analyze:
        usage: "GAUGE"
        description: "Estimated number of rows changed since last analyze"
    - last_vacuum:
        usage: "GAUGE"
        description: "Last time this table was manually vacuumed"
    - last_autovacuum:
        usage: "GAUGE"
        description: "Last time this table was vacuumed by the autovacuum daemon"
    - last_analyze:
        usage: "GAUGE"
        description: "Last time this table was manually analyzed"
    - last_autoanalyze:
        usage: "GAUGE"
        description: "Last time this table was analyzed by the autovacuum daemon"
    - vacuum_count:
        usage: "COUNTER"
        description: "Number of times this table has been manually vacuumed"
    - autovacuum_count:
        usage: "COUNTER"
        description: "Number of times this table has been vacuumed by the autovacuum daemon"
    - analyze_count:
        usage: "COUNTER"
        description: "Number of times this table has been manually analyzed"
    - autoanalyze_count:
        usage: "COUNTER"
        description: "Number of times this table has been analyzed by the autovacuum daemon"
EOF

    log_success "Configuration files generated"
}

# Start services
start_services() {
    log_info "Starting monitoring services..."

    cd docker

    # Pull latest images
    docker-compose pull

    # Start Prometheus first
    log_info "Starting Prometheus..."
    docker-compose up -d prometheus

    # Wait for Prometheus to be ready
    log_info "Waiting for Prometheus to be ready..."
    timeout 30 bash -c 'until curl -s http://localhost:9090/-/ready > /dev/null 2>&1; do sleep 2; done' || {
        log_error "Prometheus failed to start"
        exit 1
    }

    # Start AlertManager
    log_info "Starting AlertManager..."
    docker-compose up -d alertmanager

    # Start Node Exporter
    log_info "Starting Node Exporter..."
    docker-compose up -d node_exporter

    # Start cAdvisor
    log_info "Starting cAdvisor..."
    docker-compose up -d cadvisor

    # Start exporters
    log_info "Starting exporters..."
    docker-compose up -d postgres_exporter
    docker-compose up -d redis_exporter
    docker-compose up -d blackbox_exporter

    # Start Loki and Promtail
    log_info "Starting Loki and Promtail..."
    docker-compose up -d loki
    docker-compose up -d promtail

    # Start Tempo
    log_info "Starting Tempo..."
    docker-compose up -d tempo

    # Start Elasticsearch and Jaeger
    log_info "Starting Elasticsearch and Jaeger..."
    docker-compose up -d elasticsearch
    docker-compose up -d jaeger

    # Start Grafana last
    log_info "Starting Grafana..."
    docker-compose up -d grafana

    cd ..

    log_success "All services started"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:9090/-/ready > /dev/null 2>&1; then
            log_success "Prometheus is ready"
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

    # Check Prometheus
    if curl -s http://localhost:9090/graph > /dev/null; then
        log_success "✅ Prometheus is running on http://localhost:9090"
    else
        log_error "❌ Prometheus is not responding"
    fi

    # Check Grafana
    if curl -s http://localhost:3000/api/health > /dev/null; then
        log_success "✅ Grafana is running on http://localhost:3000 (admin/admin)"
    else
        log_warning "⚠️  Grafana is not responding"
    fi

    # Check AlertManager
    if curl -s http://localhost:9093/-/healthy > /dev/null; then
        log_success "✅ AlertManager is running on http://localhost:9093"
    else
        log_warning "⚠️  AlertManager is not responding"
    fi

    # Check Node Exporter
    if curl -s http://localhost:9100/metrics > /dev/null; then
        log_success "✅ Node Exporter is running on http://localhost:9100"
    else
        log_warning "⚠️  Node Exporter is not responding"
    fi

    # Check cAdvisor
    if curl -s http://localhost:8080/healthz > /dev/null; then
        log_success "✅ cAdvisor is running on http://localhost:8080"
    else
        log_warning "⚠️  cAdvisor is not responding"
    fi

    # Check targets in Prometheus
    if curl -s http://localhost:9090/api/v1/targets | grep -q "active"; then
        log_success "✅ Prometheus targets are active"
    else
        log_warning "⚠️  Prometheus targets may not be ready yet"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "============================================================"
    log_success "Monitoring Service setup completed!"
    echo "============================================================"
    echo ""
    echo "🌐 Services:"
    echo "  • Prometheus:       http://localhost:9090"
    echo "  • Grafana:          http://localhost:3000 (admin/admin)"
    echo "  • AlertManager:     http://localhost:9093"
    echo "  • Node Exporter:    http://localhost:9100/metrics"
    echo "  • cAdvisor:         http://localhost:8080"
    echo "  • Loki:             http://localhost:3100"
    echo "  • Tempo:            http://localhost:3200"
    echo "  • Jaeger:           http://localhost:16686"
    echo "  • Elasticsearch:    http://localhost:9200"
    echo ""
    echo "📊 Dashboards:"
    echo "  • Platform Overview: http://localhost:3000/d/platform-overview"
    echo "  • Infrastructure:    http://localhost:3000/d/infrastructure"
    echo "  • Business Metrics:  http://localhost:3000/d/business"
    echo ""
    echo "🔔 Alerting:"
    echo "  • AlertManager:     http://localhost:9093"
    echo "  • Notification channels configured in .env"
    echo ""
    echo "📚 Documentation:"
    echo "  • README:           platform/monitoring/README.md"
    echo "  • Dashboards:       platform/monitoring/grafana/dashboards/"
    echo "  • Alerting:         platform/monitoring/prometheus/alerting_rules.yml"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • View logs:        docker-compose -f docker/docker-compose.yml logs -f"
    echo "  • Stop services:    docker-compose -f docker/docker-compose.yml down"
    echo "  • Restart:          docker-compose -f docker/docker-compose.yml restart"
    echo "  • Check targets:    http://localhost:9090/targets"
    echo ""
    echo "🎯 Next Steps:"
    echo "  1. Configure notification channels in .env"
    echo "  2. Import custom dashboards to Grafana"
    echo "  3. Test alerting rules"
    echo "  4. Configure service discovery"
    echo ""
    log_success "Happy monitoring! 📊"
}

# Main execution
main() {
    log_info "Starting Monitoring Service setup..."

    check_dependencies
    create_directories
    generate_configs
    start_services
    wait_for_services
    verify_setup
    print_summary
}

# Run main function
main "$@"
