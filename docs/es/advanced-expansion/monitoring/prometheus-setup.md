# Instalação e Configuração do Prometheus

## Introdução

O **Prometheus** é um sistema de monitoramento e alertas open-source desenvolvido originalmente no SoundCloud e atualmente mantido pela Cloud Native Computing Foundation (CNCF). É a solução padrão de facto para monitoramento de ambientes cloud-native, containerizados e baseados em microserviços.

Neste guia, você aprenderá a instalar e configurar o Prometheus para monitorar a stack **NEO_NETBOX_ODOO**.

---

## O Que é Prometheus

### História e CNCF

```mermaid
timeline
    title Evolução do Prometheus
    2012 : Criação no SoundCloud
    2015 : Open-source público
    2016 : Graduação CNCF (após Kubernetes)
    2018 : Prometheus 2.0 (TSDB otimizado)
    2021 : Prometheus Agent Mode
    2023 : Prometheus 2.45+ (UTF-8, remote write 2.0)
    2025 : Ecossistema maduro e estável
```

### Características Principais

```yaml
Modelo de Coleta:
  - Pull-based (scraping)
  - Service discovery automático
  - Não requer agentes (exporters HTTP)

Armazenamento:
  - Time-series database (TSDB) próprio
  - Compressão eficiente
  - Storage local ou remoto (Thanos, Cortex)

Query Language:
  - PromQL (Prometheus Query Language)
  - Expressões poderosas
  - Agregações, funções matemáticas, previsões

Alertas:
  - Alerting rules no Prometheus
  - Alertmanager para gestão
  - Routing, grouping, silencing

Ecossistema:
  - 100+ exporters oficiais
  - Integração nativa com Kubernetes
  - Grafana como visualização padrão
  - Thanos para long-term storage
```

### Vantagens para NEO Stack

```yaml
Por que usar Prometheus:
  ✓ Excelente para containers Docker
  ✓ Métricas de aplicações modernas
  ✓ PromQL extremamente poderoso
  ✓ Baixo overhead de recursos
  ✓ Integração perfeita com Grafana
  ✓ Service discovery para ambientes dinâmicos
  ✓ Comunidade CNCF ativa

Quando NÃO usar apenas Prometheus:
  ✗ Logs (use Loki ou Elasticsearch)
  ✗ Traces distribuídos (use Jaeger)
  ✗ Long-term storage > 1 ano (adicione Thanos)
  ✗ Monitoramento tradicional SNMP (prefira Zabbix)
```

---

## Arquitetura do Prometheus

### Componentes do Ecossistema

```mermaid
graph TB
    subgraph "Targets Monitorados"
        T1[node_exporter<br/>Sistema OS]
        T2[cadvisor<br/>Docker]
        T3[postgres_exporter<br/>PostgreSQL]
        T4[blackbox_exporter<br/>HTTP Probes]
        T5[App /metrics<br/>Odoo, NetBox]
    end

    subgraph "Service Discovery"
        SD1[Static Configs]
        SD2[File SD]
        SD3[DNS SD]
        SD4[Docker SD]
        SD5[Kubernetes SD]
        SD6[Consul SD]
    end

    subgraph "Prometheus Core"
        PS[Prometheus Server]
        TSDB[(Time-Series DB)]
        RR[Recording Rules]
        AR[Alerting Rules]
    end

    subgraph "Gestão de Alertas"
        AM[Alertmanager]
    end

    subgraph "Visualização"
        GF[Grafana]
    end

    subgraph "Long-Term Storage"
        TH[Thanos/Cortex<br/>VictoriaMetrics]
    end

    T1 & T2 & T3 & T4 & T5 --> |HTTP /metrics| SD1 & SD2 & SD3 & SD4 & SD5 & SD6
    SD1 & SD2 & SD3 & SD4 & SD5 & SD6 --> PS
    PS --> TSDB
    PS --> RR
    PS --> AR
    AR --> AM
    PS --> GF
    PS --> |Remote Write| TH
    TH --> |Remote Read| GF

    style PS fill:#E53935,stroke:#C62828,color:#fff
    style AM fill:#FDD835,stroke:#F9A825,color:#000
    style GF fill:#FF6F00,stroke:#E65100,color:#fff
```

### Fluxo de Dados

```mermaid
sequenceDiagram
    participant P as Prometheus
    participant SD as Service Discovery
    participant E as Exporter
    participant A as Application

    Note over P: A cada scrape_interval (15s)
    P->>SD: Consulta targets dinâmicos
    SD-->>P: Lista de targets ativos
    P->>E: HTTP GET /metrics
    E->>A: Coleta métricas internas
    A-->>E: Retorna estado
    E-->>P: Métricas em formato Prometheus
    Note over P: Armazena em TSDB
    P->>P: Avalia recording rules
    P->>P: Avalia alerting rules
    alt Alerta disparado
        P->>AM: Envia alerta
    end
```

### Formato de Métricas

Prometheus usa um formato de texto simples:

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 14523
http_requests_total{method="GET",status="404"} 127
http_requests_total{method="POST",status="200"} 8932
http_requests_total{method="POST",status="500"} 43

# HELP http_request_duration_seconds HTTP request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 9821
http_request_duration_seconds_bucket{le="0.5"} 12456
http_request_duration_seconds_bucket{le="1.0"} 13892
http_request_duration_seconds_bucket{le="+Inf"} 14523
http_request_duration_seconds_sum 3456.78
http_request_duration_seconds_count 14523
```

---

## Instalação via Docker Compose

### Estrutura de Diretórios

```bash
mkdir -p /opt/neostack/prometheus/{data,config,rules,alertmanager}
cd /opt/neostack/prometheus
```

```
/opt/neostack/prometheus/
├── docker-compose.yml
├── .env
├── config/
│   ├── prometheus.yml          # Configuração principal
│   ├── targets/                # Service discovery baseado em arquivos
│   │   ├── nodes.yml
│   │   ├── docker.yml
│   │   └── databases.yml
│   └── alerts/                 # Alerting rules
│       ├── node.yml
│       ├── docker.yml
│       └── applications.yml
├── rules/
│   └── recording_rules.yml     # Recording rules (pré-agregação)
├── data/                       # Dados do TSDB (persistente)
└── alertmanager/
    └── alertmanager.yml        # Configuração Alertmanager
```

### Arquivo .env

```bash
cat > .env << 'EOF'
# Prometheus Version
PROMETHEUS_VERSION=v2.48.0

# Alertmanager Version
ALERTMANAGER_VERSION=v0.26.0

# Ports
PROMETHEUS_PORT=9090
ALERTMANAGER_PORT=9093

# Retention
PROMETHEUS_RETENTION_TIME=15d
PROMETHEUS_RETENTION_SIZE=20GB

# Network
NETWORK_NAME=monitoring
SUBNET=172.26.0.0/16

# Storage
PROMETHEUS_DATA=/opt/neostack/prometheus/data
EOF
```

### Docker Compose File

```yaml
cat > docker-compose.yml << 'EOF'
version: '3.8'

networks:
  monitoring:
    driver: bridge
    ipam:
      config:
        - subnet: ${SUBNET}

volumes:
  prometheus-data:
    driver: local
  alertmanager-data:
    driver: local

services:
  prometheus:
    image: prom/prometheus:${PROMETHEUS_VERSION}
    container_name: prometheus
    restart: unless-stopped
    user: root  # Para escrever em volumes
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=${PROMETHEUS_RETENTION_TIME}'
      - '--storage.tsdb.retention.size=${PROMETHEUS_RETENTION_SIZE}'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'  # Permite reload via API
      - '--web.enable-admin-api'  # API de administração
      - '--log.level=info'
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./config/targets:/etc/prometheus/targets:ro
      - ./config/alerts:/etc/prometheus/alerts:ro
      - ./rules:/etc/prometheus/rules:ro
      - prometheus-data:/prometheus
    networks:
      - monitoring
    ports:
      - "${PROMETHEUS_PORT}:9090"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  alertmanager:
    image: prom/alertmanager:${ALERTMANAGER_VERSION}
    container_name: alertmanager
    restart: unless-stopped
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--log.level=info'
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager-data:/alertmanager
    networks:
      - monitoring
    ports:
      - "${ALERTMANAGER_PORT}:9093"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9093/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.1'
          memory: 128M

  # Exporters essenciais
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/host/root'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/host/root:ro,rslave
    networks:
      - monitoring
    ports:
      - "9100:9100"
    deploy:
      resources:
        limits:
          cpus: '0.2'
          memory: 128M

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    devices:
      - /dev/kmsg
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
      - /dev/disk:/dev/disk:ro
    networks:
      - monitoring
    ports:
      - "8080:8080"
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  blackbox-exporter:
    image: prom/blackbox-exporter:latest
    container_name: blackbox-exporter
    restart: unless-stopped
    command:
      - '--config.file=/etc/blackbox/blackbox.yml'
    volumes:
      - ./config/blackbox.yml:/etc/blackbox/blackbox.yml:ro
    networks:
      - monitoring
    ports:
      - "9115:9115"
    deploy:
      resources:
        limits:
          cpus: '0.2'
          memory: 128M
EOF
```

### Configuração do Prometheus

```yaml
cat > config/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s          # Coletar métricas a cada 15s
  evaluation_interval: 15s      # Avaliar rules a cada 15s
  scrape_timeout: 10s
  external_labels:
    cluster: 'neo-stack-production'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Load rules
rule_files:
  - '/etc/prometheus/alerts/*.yml'
  - '/etc/prometheus/rules/*.yml'

# Scrape configurations
scrape_configs:

  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          service: 'prometheus'

  # Alertmanager
  - job_name: 'alertmanager'
    static_configs:
      - targets: ['alertmanager:9093']
        labels:
          service: 'alertmanager'

  # Node Exporter (Sistema Operacional)
  - job_name: 'node-exporter'
    file_sd_configs:
      - files:
          - '/etc/prometheus/targets/nodes.yml'
        refresh_interval: 30s
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance

  # cAdvisor (Docker Containers)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
        labels:
          service: 'docker'

  # PostgreSQL
  - job_name: 'postgres'
    file_sd_configs:
      - files:
          - '/etc/prometheus/targets/databases.yml'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance

  # Redis
  - job_name: 'redis'
    file_sd_configs:
      - files:
          - '/etc/prometheus/targets/redis.yml'

  # Blackbox Exporter (HTTP/TCP/ICMP probes)
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    file_sd_configs:
      - files:
          - '/etc/prometheus/targets/http_targets.yml'
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115

  # Odoo (custom metrics endpoint)
  - job_name: 'odoo'
    static_configs:
      - targets: ['odoo.empresa.local:8069']
        labels:
          service: 'odoo'
          environment: 'production'
    metrics_path: /metrics  # Se implementado

  # NetBox
  - job_name: 'netbox'
    static_configs:
      - targets: ['netbox.empresa.local:8000']
        labels:
          service: 'netbox'
          environment: 'production'

  # Wazuh (via custom exporter)
  - job_name: 'wazuh'
    static_configs:
      - targets: ['wazuh-exporter:9090']
        labels:
          service: 'wazuh'

  # Nginx
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
        labels:
          service: 'nginx'
EOF
```

### Service Discovery - Nodes

```yaml
cat > config/targets/nodes.yml << 'EOF'
# Lista de servidores com node_exporter instalado
- targets:
    - '192.168.1.10:9100'
  labels:
    hostname: 'odoo-server-01'
    role: 'application'
    datacenter: 'dc1'

- targets:
    - '192.168.1.20:9100'
  labels:
    hostname: 'netbox-server-01'
    role: 'application'
    datacenter: 'dc1'

- targets:
    - '192.168.1.30:9100'
  labels:
    hostname: 'wazuh-manager-01'
    role: 'security'
    datacenter: 'dc1'

- targets:
    - '192.168.1.40:9100'
  labels:
    hostname: 'postgres-server-01'
    role: 'database'
    datacenter: 'dc1'
EOF
```

### Service Discovery - Databases

```yaml
cat > config/targets/databases.yml << 'EOF'
- targets:
    - '192.168.1.40:9187'  # postgres_exporter
  labels:
    hostname: 'postgres-server-01'
    database: 'odoo'
    role: 'primary'

- targets:
    - '192.168.1.41:9187'
  labels:
    hostname: 'postgres-server-02'
    database: 'odoo'
    role: 'replica'
EOF
```

### Service Discovery - HTTP Targets (Blackbox)

```yaml
cat > config/targets/http_targets.yml << 'EOF'
- targets:
    - https://odoo.empresa.local
  labels:
    service: 'odoo'
    check_type: 'http_health'

- targets:
    - https://netbox.empresa.local
  labels:
    service: 'netbox'
    check_type: 'http_health'

- targets:
    - https://wazuh.empresa.local
  labels:
    service: 'wazuh'
    check_type: 'http_health'

- targets:
    - https://grafana.empresa.local
  labels:
    service: 'grafana'
    check_type: 'http_health'
EOF
```

### Blackbox Exporter Config

```yaml
cat > config/blackbox.yml << 'EOF'
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: []  # Default: 2xx
      method: GET
      fail_if_ssl: false
      fail_if_not_ssl: false
      tls_config:
        insecure_skip_verify: false
      preferred_ip_protocol: "ip4"

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

  icmp:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: "ip4"

  dns_google:
    prober: dns
    timeout: 5s
    dns:
      query_name: "google.com"
      query_type: "A"
EOF
```

### Iniciar Prometheus

```bash
# Ajustar permissões
chown -R 65534:65534 /opt/neostack/prometheus/data

# Validar configuração antes de iniciar
docker run --rm -v $(pwd)/config:/etc/prometheus \
  prom/prometheus:v2.48.0 \
  promtool check config /etc/prometheus/prometheus.yml

# Iniciar
cd /opt/neostack/prometheus
docker-compose up -d

# Verificar logs
docker-compose logs -f prometheus

# Verificar status
docker-compose ps

# Acessar interface
# http://seu-servidor:9090
```

---

## Exporters Essenciais

### 1. node_exporter (Sistema Operacional)

**Instalação em Servidor Linux:**

```bash
#!/bin/bash
# Instalar node_exporter

NODE_EXPORTER_VERSION="1.7.0"

# Download
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz

# Extrair
tar xvfz node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
sudo mv node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/

# Criar usuário
sudo useradd --no-create-home --shell /bin/false node_exporter

# Criar systemd service
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<'SYSTEMD'
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter \
  --collector.filesystem.mount-points-exclude=^/(dev|proc|sys|var/lib/docker/.+|var/lib/kubelet/.+)($|/) \
  --collector.filesystem.fs-types-exclude=^(autofs|binfmt_misc|bpf|cgroup2?|configfs|debugfs|devpts|devtmpfs|fusectl|hugetlbfs|iso9660|mqueue|nsfs|overlay|proc|procfs|pstore|rpc_pipefs|securityfs|selinuxfs|squashfs|sysfs|tracefs)$

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SYSTEMD

# Iniciar
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter

# Verificar
sudo systemctl status node_exporter
curl http://localhost:9100/metrics
```

**Métricas Coletadas:**

```yaml
CPU:
  - node_cpu_seconds_total
  - node_load1, node_load5, node_load15

Memória:
  - node_memory_MemTotal_bytes
  - node_memory_MemFree_bytes
  - node_memory_MemAvailable_bytes
  - node_memory_Cached_bytes
  - node_memory_Buffers_bytes

Disco:
  - node_filesystem_avail_bytes
  - node_filesystem_size_bytes
  - node_filesystem_files
  - node_disk_io_time_seconds_total
  - node_disk_read_bytes_total
  - node_disk_written_bytes_total

Rede:
  - node_network_receive_bytes_total
  - node_network_transmit_bytes_total
  - node_network_receive_errs_total
  - node_network_transmit_errs_total
```

### 2. cAdvisor (Docker Containers)

**Já incluído no docker-compose.yml acima.**

**Métricas Coletadas:**

```yaml
CPU:
  - container_cpu_usage_seconds_total
  - container_cpu_system_seconds_total
  - container_cpu_user_seconds_total

Memória:
  - container_memory_usage_bytes
  - container_memory_max_usage_bytes
  - container_memory_cache
  - container_memory_rss
  - container_memory_working_set_bytes

Rede:
  - container_network_receive_bytes_total
  - container_network_transmit_bytes_total
  - container_network_receive_errors_total

Disco:
  - container_fs_usage_bytes
  - container_fs_limit_bytes
  - container_fs_reads_bytes_total
  - container_fs_writes_bytes_total
```

### 3. postgres_exporter (PostgreSQL)

**Instalação:**

```bash
#!/bin/bash

# Via Docker (recomendado)
docker run -d --name postgres_exporter \
  --restart=unless-stopped \
  -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://exporter:senha@postgres:5432/odoo?sslmode=disable" \
  prometheuscommunity/postgres-exporter:latest

# OU via binário
POSTGRES_EXPORTER_VERSION="0.15.0"
wget https://github.com/prometheus-community/postgres_exporter/releases/download/v${POSTGRES_EXPORTER_VERSION}/postgres_exporter-${POSTGRES_EXPORTER_VERSION}.linux-amd64.tar.gz
tar xvfz postgres_exporter-${POSTGRES_EXPORTER_VERSION}.linux-amd64.tar.gz
sudo mv postgres_exporter-${POSTGRES_EXPORTER_VERSION}.linux-amd64/postgres_exporter /usr/local/bin/
```

**Criar Usuário de Monitoramento no PostgreSQL:**

```sql
-- Conectar como superuser
CREATE USER exporter WITH PASSWORD 'senha_forte_aqui';
ALTER USER exporter SET SEARCH_PATH TO exporter,pg_catalog;

-- Criar schema
CREATE SCHEMA IF NOT EXISTS exporter;
GRANT USAGE ON SCHEMA exporter TO exporter;

-- Permissões de leitura
GRANT pg_monitor TO exporter;
GRANT SELECT ON pg_stat_database TO exporter;

-- Funções customizadas (opcional)
CREATE OR REPLACE FUNCTION exporter.pg_stat_statements_reset()
RETURNS void AS $$
  SELECT pg_stat_statements_reset();
$$ LANGUAGE SQL VOLATILE;
```

**Métricas Principais:**

```yaml
Connections:
  - pg_stat_database_numbackends
  - pg_settings_max_connections

Performance:
  - pg_stat_database_tup_fetched
  - pg_stat_database_tup_inserted
  - pg_stat_database_tup_updated
  - pg_stat_database_tup_deleted
  - pg_stat_database_xact_commit
  - pg_stat_database_xact_rollback

Locks:
  - pg_locks_count

Replication:
  - pg_replication_lag_bytes
  - pg_stat_replication_pg_wal_lsn_diff
```

### 4. redis_exporter (Redis)

```bash
# Via Docker
docker run -d --name redis_exporter \
  --restart=unless-stopped \
  -p 9121:9121 \
  oliver006/redis_exporter:latest \
  --redis.addr=redis://redis:6379 \
  --redis.password=sua_senha_redis
```

**Métricas:**

```yaml
Memory:
  - redis_memory_used_bytes
  - redis_memory_max_bytes
  - redis_memory_fragmentation_ratio

Keys:
  - redis_db_keys
  - redis_db_keys_expiring

Performance:
  - redis_commands_processed_total
  - redis_keyspace_hits_total
  - redis_keyspace_misses_total

Connections:
  - redis_connected_clients
  - redis_rejected_connections_total
```

### 5. blackbox_exporter (HTTP/TCP/ICMP)

**Já incluído no docker-compose.yml.**

**Uso - Exemplos de Queries:**

```promql
# Verificar se endpoint está UP
probe_success{job="blackbox-http"}

# Latência HTTP
probe_http_duration_seconds{job="blackbox-http"}

# SSL Certificate expiry
probe_ssl_earliest_cert_expiry{job="blackbox-http"}

# DNS lookup time
probe_dns_lookup_time_seconds
```

---

## Recording Rules

Recording rules pré-calculam queries complexas, reduzindo carga de queries repetitivas.

```yaml
cat > rules/recording_rules.yml << 'EOF'
groups:
  - name: node_recording_rules
    interval: 30s
    rules:
      # CPU usage percentual
      - record: instance:node_cpu_utilisation:rate5m
        expr: |
          100 - (
            avg by (instance) (
              rate(node_cpu_seconds_total{mode="idle"}[5m])
            ) * 100
          )

      # Memória usage percentual
      - record: instance:node_memory_utilisation:ratio
        expr: |
          (
            node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
          ) / node_memory_MemTotal_bytes

      # Disco usage percentual
      - record: instance:node_filesystem_usage:ratio
        expr: |
          (
            node_filesystem_size_bytes{fstype!~"tmpfs|fuse.lxcfs"} -
            node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs"}
          ) / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.lxcfs"}

  - name: http_recording_rules
    interval: 1m
    rules:
      # Request rate (RPS)
      - record: job:http_requests:rate5m
        expr: |
          sum by (job, instance) (
            rate(http_requests_total[5m])
          )

      # Error rate
      - record: job:http_errors:rate5m
        expr: |
          sum by (job, instance) (
            rate(http_requests_total{status=~"5.."}[5m])
          )

      # P95 latency
      - record: job:http_request_duration:p95
        expr: |
          histogram_quantile(0.95,
            sum by (job, instance, le) (
              rate(http_request_duration_seconds_bucket[5m])
            )
          )

  - name: postgresql_recording_rules
    interval: 1m
    rules:
      # Connection usage ratio
      - record: instance:postgresql_connection_usage:ratio
        expr: |
          pg_stat_database_numbackends /
          pg_settings_max_connections

      # Transaction rate
      - record: instance:postgresql_transactions:rate5m
        expr: |
          sum by (instance, datname) (
            rate(pg_stat_database_xact_commit[5m]) +
            rate(pg_stat_database_xact_rollback[5m])
          )

      # Cache hit ratio
      - record: instance:postgresql_cache_hit_ratio:rate5m
        expr: |
          sum by (instance, datname) (
            rate(pg_stat_database_blks_hit[5m])
          ) /
          sum by (instance, datname) (
            rate(pg_stat_database_blks_hit[5m]) +
            rate(pg_stat_database_blks_read[5m])
          )
EOF
```

**Validar Rules:**

```bash
docker exec prometheus promtool check rules /etc/prometheus/rules/recording_rules.yml

# Reload config (sem restart)
curl -X POST http://localhost:9090/-/reload
```

---

## Alerting Rules

```yaml
cat > config/alerts/node.yml << 'EOF'
groups:
  - name: node_alerts
    interval: 30s
    rules:
      - alert: NodeDown
        expr: up{job="node-exporter"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Node {{ $labels.instance }} is down"
          description: "Node exporter on {{ $labels.instance }} has been down for more than 1 minute."

      - alert: NodeHighCPU
        expr: instance:node_cpu_utilisation:rate5m > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}% on {{ $labels.instance }}."

      - alert: NodeCriticalCPU
        expr: instance:node_cpu_utilisation:rate5m > 95
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Critical CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}% on {{ $labels.instance }}."

      - alert: NodeHighMemory
        expr: instance:node_memory_utilisation:ratio > 0.90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value | humanizePercentage }} on {{ $labels.instance }}."

      - alert: NodeDiskSpaceLow
        expr: instance:node_filesystem_usage:ratio > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"
          description: "Disk {{ $labels.mountpoint }} is {{ $value | humanizePercentage }} full on {{ $labels.instance }}."

      - alert: NodeDiskSpaceCritical
        expr: instance:node_filesystem_usage:ratio > 0.95
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Critical disk space on {{ $labels.instance }}"
          description: "Disk {{ $labels.mountpoint }} is {{ $value | humanizePercentage }} full on {{ $labels.instance }}. Immediate action required!"
EOF
```

```yaml
cat > config/alerts/docker.yml << 'EOF'
groups:
  - name: docker_alerts
    interval: 30s
    rules:
      - alert: ContainerDown
        expr: time() - container_last_seen{name!=""} > 60
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Container {{ $labels.name }} is down"
          description: "Container {{ $labels.name }} on {{ $labels.instance }} has been down for more than 1 minute."

      - alert: ContainerHighCPU
        expr: |
          (
            rate(container_cpu_usage_seconds_total{name!=""}[5m]) * 100
          ) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage in container {{ $labels.name }}"
          description: "Container {{ $labels.name }} is using {{ $value }}% CPU."

      - alert: ContainerHighMemory
        expr: |
          (
            container_memory_usage_bytes{name!=""} /
            container_spec_memory_limit_bytes{name!=""} * 100
          ) > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage in container {{ $labels.name }}"
          description: "Container {{ $labels.name }} is using {{ $value }}% of its memory limit."

      - alert: ContainerOOMKilled
        expr: increase(container_oom_events_total[5m]) > 0
        labels:
          severity: critical
        annotations:
          summary: "Container {{ $labels.name }} was OOM killed"
          description: "Container {{ $labels.name }} on {{ $labels.instance }} was killed due to Out Of Memory."
EOF
```

```yaml
cat > config/alerts/applications.yml << 'EOF'
groups:
  - name: http_alerts
    interval: 30s
    rules:
      - alert: ServiceDown
        expr: probe_success{job="blackbox-http"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          description: "HTTP probe failed for {{ $labels.instance }}."

      - alert: HighHTTPErrorRate
        expr: |
          (
            sum by (job, instance) (rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum by (job, instance) (rate(http_requests_total[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High HTTP error rate on {{ $labels.instance }}"
          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.instance }}."

      - alert: HighLatency
        expr: job:http_request_duration:p95 > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on {{ $labels.instance }}"
          description: "P95 latency is {{ $value }}s on {{ $labels.instance }}."

      - alert: SSLCertificateExpiringSoon
        expr: (probe_ssl_earliest_cert_expiry - time()) / 86400 < 30
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "SSL certificate expiring soon for {{ $labels.instance }}"
          description: "SSL certificate for {{ $labels.instance }} expires in {{ $value }} days."

  - name: postgresql_alerts
    interval: 1m
    rules:
      - alert: PostgreSQLDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down on {{ $labels.instance }}"
          description: "PostgreSQL instance {{ $labels.instance }} is unreachable."

      - alert: PostgreSQLHighConnections
        expr: instance:postgresql_connection_usage:ratio > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High connection usage on {{ $labels.instance }}"
          description: "PostgreSQL is using {{ $value | humanizePercentage }} of max connections."

      - alert: PostgreSQLReplicationLag
        expr: pg_replication_lag_bytes > 1e9  # 1GB
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High replication lag on {{ $labels.instance }}"
          description: "Replication lag is {{ $value | humanize }}B on {{ $labels.instance }}."

      - alert: PostgreSQLDeadlocks
        expr: rate(pg_stat_database_deadlocks[5m]) > 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Deadlocks detected on {{ $labels.instance }}"
          description: "Database {{ $labels.datname }} is experiencing deadlocks."
EOF
```

---

## Retenção de Dados

### Estratégia de Retenção

```yaml
Curto Prazo (Prometheus local):
  Período: 15 dias
  Resolução: Alta (15s scrape)
  Uso: Troubleshooting, alertas em tempo real

Médio Prazo (Prometheus + recording rules):
  Período: 90 dias
  Resolução: Média (1m aggregation)
  Uso: Análise de tendências, capacity planning

Longo Prazo (Thanos/Cortex/VictoriaMetrics):
  Período: 1-2 anos
  Resolução: Baixa (5m-1h aggregation)
  Uso: Compliance, análise histórica, SLA reports
```

### Configurar Thanos Sidecar (Long-Term Storage)

```yaml
# docker-compose.yml - adicionar serviço Thanos
  thanos-sidecar:
    image: quay.io/thanos/thanos:v0.33.0
    container_name: thanos-sidecar
    restart: unless-stopped
    command:
      - 'sidecar'
      - '--tsdb.path=/prometheus'
      - '--prometheus.url=http://prometheus:9090'
      - '--objstore.config-file=/etc/thanos/bucket.yml'
      - '--http-address=0.0.0.0:19191'
      - '--grpc-address=0.0.0.0:19090'
    volumes:
      - prometheus-data:/prometheus:ro
      - ./thanos/bucket.yml:/etc/thanos/bucket.yml:ro
    networks:
      - monitoring
    ports:
      - "19090:19090"
      - "19191:19191"
```

**Bucket Config (S3 ou Minio):**

```yaml
cat > thanos/bucket.yml << 'EOF'
type: S3
config:
  bucket: "thanos-metrics"
  endpoint: "s3.amazonaws.com"
  region: "us-east-1"
  access_key: "YOUR_ACCESS_KEY"
  secret_key: "YOUR_SECRET_KEY"
  insecure: false
EOF
```

---

## PromQL - Queries Essenciais

### CPU

```promql
# CPU usage médio por instância
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Top 5 instâncias com maior CPU
topk(5, 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100))

# CPU por modo (user, system, iowait)
sum by (instance, mode) (rate(node_cpu_seconds_total[5m]))
```

### Memória

```promql
# Memória available ratio
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes

# Memória usage percentual
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Top 5 containers com maior uso de memória
topk(5, container_memory_usage_bytes{name!=""})
```

### Disco

```promql
# Espaço livre em disco
node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs"}

# Disco usage percentual
(node_filesystem_size_bytes - node_filesystem_avail_bytes) / node_filesystem_size_bytes * 100

# IOPS de leitura
rate(node_disk_reads_completed_total[5m])

# IOPS de escrita
rate(node_disk_writes_completed_total[5m])
```

### Rede

```promql
# Network bandwidth (in)
rate(node_network_receive_bytes_total{device!="lo"}[5m]) * 8

# Network bandwidth (out)
rate(node_network_transmit_bytes_total{device!="lo"}[5m]) * 8

# Network errors
rate(node_network_receive_errs_total[5m]) + rate(node_network_transmit_errs_total[5m])
```

### HTTP

```promql
# Request rate (RPS)
sum(rate(http_requests_total[5m]))

# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# P95 latency
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

# P99 latency
histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
```

### PostgreSQL

```promql
# Active connections
pg_stat_database_numbackends

# Transaction rate
rate(pg_stat_database_xact_commit[5m]) + rate(pg_stat_database_xact_rollback[5m])

# Cache hit ratio
sum(rate(pg_stat_database_blks_hit[5m])) / (sum(rate(pg_stat_database_blks_hit[5m])) + sum(rate(pg_stat_database_blks_read[5m])))

# Replication lag (seconds)
pg_replication_lag_seconds
```

---

## Troubleshooting

### Comandos Úteis

```bash
# Verificar status de targets
curl http://localhost:9090/api/v1/targets | jq

# Reload config sem restart
curl -X POST http://localhost:9090/-/reload

# Testar query via API
curl -G http://localhost:9090/api/v1/query --data-urlencode 'query=up'

# Validar config
docker exec prometheus promtool check config /etc/prometheus/prometheus.yml

# Validar rules
docker exec prometheus promtool check rules /etc/prometheus/alerts/*.yml

# Query range (histórico)
curl -G http://localhost:9090/api/v1/query_range \
  --data-urlencode 'query=up' \
  --data-urlencode 'start=2025-12-05T00:00:00Z' \
  --data-urlencode 'end=2025-12-05T23:59:59Z' \
  --data-urlencode 'step=15s'
```

### Problemas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| **Target down** | Firewall, exporter não rodando | Verificar conectividade, logs do exporter |
| **No data** | Scrape timeout, target incorreto | Aumentar timeout, verificar endpoint /metrics |
| **High memory usage** | Retenção muito longa, cardinalidade alta | Reduzir retenção, otimizar labels |
| **Slow queries** | Query complexa sem recording rule | Criar recording rule |
| **Alerts não disparam** | Expressão incorreta, Alertmanager down | Testar expressão, verificar Alertmanager |

---

**Autor:** Equipe NEO_NETBOX_ODOO Stack
**Última Atualização:** 2025-12-05
**Versão:** 1.0
