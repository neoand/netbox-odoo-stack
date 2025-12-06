# Monitorando a Stack NEO_NETBOX_ODOO

## Introdução

Este guia apresenta configurações detalhadas para monitorar cada componente da stack **NEO_NETBOX_ODOO**: Odoo 19, NetBox, Wazuh Manager, PostgreSQL, Redis, Nginx, Docker, TheHive, MISP e Cortex.

Cada seção inclui:
- Exporters/agentes necessários
- Métricas essenciais
- Queries PromQL úteis
- Alertas recomendados
- Health checks
- Troubleshooting guiado

---

## 1. Odoo 19

### Arquitetura de Monitoramento

```mermaid
graph LR
    A[Usuários] --> B[Nginx]
    B --> C[Odoo Workers]
    C --> D[PostgreSQL]
    C --> E[Redis]

    C --> F[Prometheus<br/>custom exporter]
    D --> G[postgres_exporter]
    E --> H[redis_exporter]
    B --> I[nginx_exporter]

    F & G & H & I --> J[Prometheus]
    J --> K[Grafana]

    style C fill:#7C4DFF,stroke:#5E35B1,color:#fff
    style J fill:#E53935,stroke:#C62828,color:#fff
```

### Métricas Disponíveis

#### Via Custom Exporter

**Implementar endpoint /metrics no Odoo:**

```python
# odoo/addons/prometheus_monitoring/controllers/metrics.py

from odoo import http
from odoo.http import request
import time

class PrometheusMetrics(http.Controller):
    @http.route('/metrics', type='http', auth='none', csrf=False)
    def metrics(self):
        """Expose Prometheus metrics"""
        metrics = []

        # Active sessions
        active_sessions = request.env['res.users'].sudo().search_count([
            ('login_date', '>=', time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(time.time() - 900)))
        ])
        metrics.append(f'odoo_active_sessions {active_sessions}')

        # Database connections
        request.env.cr.execute("SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()")
        db_connections = request.env.cr.fetchone()[0]
        metrics.append(f'odoo_database_connections {db_connections}')

        # Workers (from config)
        workers = request.env['ir.config_parameter'].sudo().get_param('workers', 4)
        metrics.append(f'odoo_workers_configured {workers}')

        # Pending jobs (queue)
        pending_jobs = request.env['queue.job'].sudo().search_count([
            ('state', 'in', ['pending', 'enqueued'])
        ])
        metrics.append(f'odoo_queue_pending_jobs {pending_jobs}')

        # Failed jobs
        failed_jobs = request.env['queue.job'].sudo().search_count([
            ('state', '=', 'failed')
        ])
        metrics.append(f'odoo_queue_failed_jobs {failed_jobs}')

        # HTTP requests (counter via middleware)
        # (implementar middleware separado)

        response = '\n'.join(metrics) + '\n'
        return request.make_response(
            response,
            headers=[('Content-Type', 'text/plain; version=0.0.4')]
        )
```

**Adicionar ao Prometheus:**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'odoo'
    static_configs:
      - targets: ['odoo:8069']
    metrics_path: '/metrics'
    scheme: http
```

#### Via Logs (Parsing com mtail ou similar)

```bash
# Instalar mtail para extrair métricas de logs
docker run -d --name mtail \
  -p 3903:3903 \
  -v /var/log/odoo:/logs:ro \
  -v /opt/mtail/odoo.mtail:/etc/mtail/odoo.mtail:ro \
  mtail/mtail \
  --logs /logs/odoo-server.log \
  --progs /etc/mtail/odoo.mtail
```

```perl
# /opt/mtail/odoo.mtail - Programa mtail para parsear logs Odoo

# HTTP requests
/^(?P<timestamp>\S+ \S+) \d+ INFO \S+ odoo.http: (?P<method>GET|POST|PUT|DELETE) (?P<path>\S+) - (?P<status>\d{3}) / {
  http_requests_total[$method][$status]++
}

# Response time
/response time: (?P<duration>[\d.]+)s/ {
  http_request_duration_seconds = $duration
}

# Errors
/ERROR/ {
  odoo_errors_total++
}

# Warnings
/WARNING/ {
  odoo_warnings_total++
}
```

### Queries PromQL Essenciais

```promql
# Active sessions
odoo_active_sessions

# Database connections usage (%)
(odoo_database_connections / pg_settings_max_connections) * 100

# Queue jobs pending (tendência crescente = problema)
rate(odoo_queue_pending_jobs[5m]) > 0

# Failed jobs (deve ser 0)
odoo_queue_failed_jobs

# HTTP request rate
rate(http_requests_total{job="odoo"}[5m])

# HTTP error rate (%)
(
  rate(http_requests_total{job="odoo",status=~"5.."}[5m])
  /
  rate(http_requests_total{job="odoo"}[5m])
) * 100

# P95 latency
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket{job="odoo"}[5m])
)

# Container CPU
rate(container_cpu_usage_seconds_total{name=~".*odoo.*"}[5m]) * 100

# Container memory
container_memory_usage_bytes{name=~".*odoo.*"} / 1024 / 1024
```

### Alertas Recomendados

```yaml
# alerts/odoo.yml
groups:
  - name: odoo_alerts
    interval: 1m
    rules:
      - alert: OdooDown
        expr: up{job="odoo"} == 0
        for: 2m
        labels:
          severity: critical
          service: odoo
        annotations:
          summary: "Odoo is down"
          description: "Odoo on {{ $labels.instance }} has been unreachable for 2 minutes."
          runbook_url: "https://wiki.empresa.local/runbooks/odoo-down"

      - alert: OdooHighLatency
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket{job="odoo"}[5m])
          ) > 2
        for: 5m
        labels:
          severity: warning
          service: odoo
        annotations:
          summary: "High latency on Odoo"
          description: "P95 latency is {{ $value }}s on Odoo."

      - alert: OdooHighErrorRate
        expr: |
          (
            rate(http_requests_total{job="odoo",status=~"5.."}[5m])
            /
            rate(http_requests_total{job="odoo"}[5m])
          ) > 0.05
        for: 5m
        labels:
          severity: warning
          service: odoo
        annotations:
          summary: "High error rate on Odoo"
          description: "Error rate is {{ $value | humanizePercentage }} on Odoo."

      - alert: OdooQueueBacklog
        expr: odoo_queue_pending_jobs > 1000
        for: 10m
        labels:
          severity: warning
          service: odoo
        annotations:
          summary: "High queue backlog on Odoo"
          description: "There are {{ $value }} pending jobs in Odoo queue."

      - alert: OdooFailedJobs
        expr: increase(odoo_queue_failed_jobs[10m]) > 10
        labels:
          severity: warning
          service: odoo
        annotations:
          summary: "Multiple failed jobs on Odoo"
          description: "{{ $value }} jobs failed in the last 10 minutes."

      - alert: OdooHighDatabaseConnections
        expr: |
          (odoo_database_connections / pg_settings_max_connections{datname="odoo"}) > 0.8
        for: 5m
        labels:
          severity: warning
          service: odoo
        annotations:
          summary: "High database connections usage"
          description: "Odoo is using {{ $value | humanizePercentage }} of max database connections."
```

### Health Checks

```yaml
# Synthetic monitoring com blackbox_exporter
scrape_configs:
  - job_name: 'blackbox-odoo'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - https://odoo.empresa.local
          - https://odoo.empresa.local/web/login
          - https://odoo.empresa.local/web/database/manager
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

**Alertas de Health Check:**

```yaml
- alert: OdooHealthCheckFailed
  expr: probe_success{job="blackbox-odoo"} == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Odoo health check failed"
    description: "Health check for {{ $labels.instance }} has been failing for 2 minutes."
```

---

## 2. NetBox

### Métricas Disponíveis

#### Via Django Prometheus (netbox-prometheus-sd)

```bash
# Adicionar ao docker-compose do NetBox
# netbox/configuration.py

PLUGINS = [
    'netbox_prometheus_sd',
]

# requirements.txt
django-prometheus==2.3.1
```

**Endpoint:** `http://netbox:8000/metrics`

#### Queries PromQL

```promql
# NetBox availability
probe_success{instance=~".*netbox.*"}

# API response time
probe_http_duration_seconds{instance=~".*netbox.*"}

# Django requests rate
rate(django_http_requests_total_by_method_total{job="netbox"}[5m])

# Django exceptions
rate(django_http_exceptions_total_by_type_total{job="netbox"}[5m])

# Database queries
rate(django_db_query_total{job="netbox"}[5m])

# Redis cache hit rate
(
  redis_keyspace_hits_total{job="netbox-redis"}
  /
  (redis_keyspace_hits_total{job="netbox-redis"} + redis_keyspace_misses_total{job="netbox-redis"})
)
```

### Alertas Recomendados

```yaml
- alert: NetBoxDown
  expr: probe_success{instance=~".*netbox.*"} == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "NetBox is unreachable"

- alert: NetBoxAPISlowResponse
  expr: probe_http_duration_seconds{instance=~".*netbox.*"} > 2
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "NetBox API is responding slowly"
    description: "API response time is {{ $value }}s."

- alert: NetBoxHighExceptionRate
  expr: rate(django_http_exceptions_total_by_type_total{job="netbox"}[5m]) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High exception rate on NetBox"
```

### Integração com Odoo (Sync Status)

```python
# Custom exporter para status de sync

from prometheus_client import Gauge, CollectorRegistry, generate_latest
from datetime import datetime
import psycopg2

registry = CollectorRegistry()

# Métrica: última sincronização NetBox -> Odoo
last_sync = Gauge('netbox_odoo_last_sync_timestamp',
                  'Timestamp of last successful sync',
                  registry=registry)

drift_count = Gauge('netbox_odoo_drift_count',
                    'Number of objects out of sync',
                    registry=registry)

def check_sync_status():
    # Consultar database para verificar última sync
    conn = psycopg2.connect(
        host='postgres',
        database='odoo',
        user='odoo',
        password='password'
    )
    cur = conn.cursor()

    # Última sincronização
    cur.execute("""
        SELECT MAX(write_date) FROM integration_sync_log
        WHERE source = 'netbox' AND status = 'success'
    """)
    last = cur.fetchone()[0]
    if last:
        last_sync.set(last.timestamp())

    # Objetos fora de sync (drift)
    cur.execute("""
        SELECT COUNT(*) FROM integration_drift
        WHERE source = 'netbox'
    """)
    drift = cur.fetchone()[0]
    drift_count.set(drift)

    cur.close()
    conn.close()

# Endpoint HTTP
from flask import Flask, Response
app = Flask(__name__)

@app.route('/metrics')
def metrics():
    check_sync_status()
    return Response(generate_latest(registry), mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9091)
```

---

## 3. Wazuh Manager

### Métricas Disponíveis

#### Via Custom Exporter (wazuh_exporter)

```python
#!/usr/bin/env python3
# wazuh_exporter.py

from prometheus_client import Gauge, Counter, CollectorRegistry, generate_latest
from flask import Flask, Response
import requests
import json

registry = CollectorRegistry()

# Métricas
agents_active = Gauge('wazuh_agents_active', 'Active agents', registry=registry)
agents_disconnected = Gauge('wazuh_agents_disconnected', 'Disconnected agents', registry=registry)
agents_pending = Gauge('wazuh_agents_pending', 'Pending agents', registry=registry)
events_per_second = Gauge('wazuh_events_per_second', 'Current EPS', registry=registry)
queue_usage = Gauge('wazuh_queue_usage_percent', 'Queue usage percentage', registry=registry)

# Alertas por severidade
alerts_by_level = Counter('wazuh_alerts_by_level', 'Alerts by level', ['level'], registry=registry)

WAZUH_API = "https://wazuh-manager:55000"
WAZUH_USER = "monitoring"
WAZUH_PASS = "password"

def get_token():
    response = requests.post(
        f"{WAZUH_API}/security/user/authenticate",
        auth=(WAZUH_USER, WAZUH_PASS),
        verify=False
    )
    return response.json()['data']['token']

def collect_metrics():
    token = get_token()
    headers = {'Authorization': f'Bearer {token}'}

    # Agent stats
    response = requests.get(f"{WAZUH_API}/agents/summary/status", headers=headers, verify=False)
    data = response.json()['data']

    agents_active.set(data['connection']['active'])
    agents_disconnected.set(data['connection']['disconnected'])
    agents_pending.set(data['connection']['pending'])

    # Cluster stats
    response = requests.get(f"{WAZUH_API}/cluster/healthcheck", headers=headers, verify=False)
    # Processar...

app = Flask(__name__)

@app.route('/metrics')
def metrics():
    collect_metrics()
    return Response(generate_latest(registry), mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9090)
```

#### Via Elasticsearch (Alertas Wazuh)

```yaml
# Grafana datasource: Elasticsearch-Wazuh
# Query examples:

# Total alerts last 24h
{
  "index": "wazuh-alerts-*",
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-24h"
      }
    }
  }
}

# Alerts by severity
{
  "aggs": {
    "severity": {
      "terms": {
        "field": "rule.level"
      }
    }
  }
}
```

### Queries PromQL

```promql
# Agentes ativos
wazuh_agents_active

# Taxa de agentes offline (%)
(wazuh_agents_disconnected / (wazuh_agents_active + wazuh_agents_disconnected)) * 100

# EPS (Events Per Second)
wazuh_events_per_second

# Queue usage (alerta se > 80%)
wazuh_queue_usage_percent

# Alertas críticos (últimos 5 min)
increase(wazuh_alerts_by_level{level="15"}[5m])
```

### Alertas Recomendados

```yaml
- alert: WazuhManagerDown
  expr: up{job="wazuh"} == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Wazuh Manager is down"

- alert: WazuhHighAgentsOffline
  expr: |
    (wazuh_agents_disconnected / (wazuh_agents_active + wazuh_agents_disconnected)) > 0.1
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "High percentage of Wazuh agents offline"
    description: "{{ $value | humanizePercentage }} of agents are disconnected."

- alert: WazuhQueueOverload
  expr: wazuh_queue_usage_percent > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Wazuh queue overloaded"
    description: "Queue usage is {{ $value }}%."

- alert: WazuhCriticalAlerts
  expr: increase(wazuh_alerts_by_level{level=~"1[2-5]"}[10m]) > 10
  labels:
    severity: critical
  annotations:
    summary: "Multiple critical security alerts"
    description: "{{ $value }} critical alerts in last 10 minutes."
```

---

## 4. PostgreSQL

### Exporters

```bash
# postgres_exporter
docker run -d --name postgres_exporter \
  -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://exporter:password@postgres:5432/odoo?sslmode=disable" \
  prometheuscommunity/postgres-exporter:latest
```

### Queries PromQL Essenciais

```promql
# Conexões ativas
pg_stat_database_numbackends{datname="odoo"}

# Connection usage (%)
(pg_stat_database_numbackends / pg_settings_max_connections) * 100

# Transaction rate (TPS)
rate(pg_stat_database_xact_commit[5m]) + rate(pg_stat_database_xact_rollback[5m])

# Cache hit ratio (deve ser > 95%)
(
  rate(pg_stat_database_blks_hit[5m])
  /
  (rate(pg_stat_database_blks_hit[5m]) + rate(pg_stat_database_blks_read[5m]))
) * 100

# Queries ativas
pg_stat_activity_count{state="active"}

# Slow queries (> 1s)
pg_stat_statements_max_exec_time_seconds > 1

# Deadlocks
rate(pg_stat_database_deadlocks[5m])

# Replication lag (se aplicável)
pg_replication_lag_bytes / 1024 / 1024  # MB
```

### Alertas Recomendados

```yaml
- alert: PostgreSQLDown
  expr: pg_up == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "PostgreSQL is down"

- alert: PostgreSQLHighConnections
  expr: (pg_stat_database_numbackends / pg_settings_max_connections) > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High database connections usage"

- alert: PostgreSQLLowCacheHitRatio
  expr: |
    (
      rate(pg_stat_database_blks_hit[5m])
      /
      (rate(pg_stat_database_blks_hit[5m]) + rate(pg_stat_database_blks_read[5m]))
    ) < 0.95
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Low cache hit ratio on PostgreSQL"
    description: "Cache hit ratio is {{ $value | humanizePercentage }}."

- alert: PostgreSQLDeadlocks
  expr: rate(pg_stat_database_deadlocks[5m]) > 0
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Deadlocks detected on PostgreSQL"

- alert: PostgreSQLReplicationLag
  expr: pg_replication_lag_bytes > 1073741824  # 1GB
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High replication lag"
    description: "Replication lag is {{ $value | humanize }}B."

- alert: PostgreSQLTooManySlowQueries
  expr: pg_stat_statements_max_exec_time_seconds > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Multiple slow queries detected"
```

---

## 5. Redis

### Exporter

```bash
docker run -d --name redis_exporter \
  -p 9121:9121 \
  oliver006/redis_exporter:latest \
  --redis.addr=redis://redis:6379 \
  --redis.password=sua_senha
```

### Queries PromQL

```promql
# Memória usada
redis_memory_used_bytes / 1024 / 1024  # MB

# Memory usage (%)
(redis_memory_used_bytes / redis_memory_max_bytes) * 100

# Fragmentation ratio (ideal: 1.0-1.5)
redis_memory_fragmentation_ratio

# Keys no database
redis_db_keys{db="db0"}

# Keys expirando
redis_db_keys_expiring{db="db0"}

# Hit rate (%)
(
  rate(redis_keyspace_hits_total[5m])
  /
  (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))
) * 100

# Commands per second
rate(redis_commands_processed_total[5m])

# Connected clients
redis_connected_clients

# Evicted keys (não deve haver)
rate(redis_evicted_keys_total[5m])
```

### Alertas Recomendados

```yaml
- alert: RedisDown
  expr: redis_up == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Redis is down"

- alert: RedisHighMemoryUsage
  expr: (redis_memory_used_bytes / redis_memory_max_bytes) > 0.9
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High memory usage on Redis"

- alert: RedisHighFragmentation
  expr: redis_memory_fragmentation_ratio > 1.5
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "High memory fragmentation on Redis"

- alert: RedisLowHitRate
  expr: |
    (
      rate(redis_keyspace_hits_total[5m])
      /
      (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))
    ) < 0.8
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Low cache hit rate on Redis"

- alert: RedisEvictingKeys
  expr: rate(redis_evicted_keys_total[5m]) > 0
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Redis is evicting keys"
    description: "Redis is running out of memory and evicting keys."
```

---

## 6. Nginx

### Exporter

```bash
# nginx-prometheus-exporter
docker run -d --name nginx_exporter \
  -p 9113:9113 \
  nginx/nginx-prometheus-exporter:latest \
  -nginx.scrape-uri=http://nginx:8080/stub_status
```

**Habilitar stub_status no Nginx:**

```nginx
# /etc/nginx/conf.d/status.conf
server {
    listen 8080;
    server_name localhost;

    location /stub_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 172.16.0.0/12;  # Docker network
        deny all;
    }
}
```

### Queries PromQL

```promql
# Requests per second
rate(nginx_http_requests_total[5m])

# Active connections
nginx_http_connections_active

# Connections per state
nginx_http_connections_reading
nginx_http_connections_writing
nginx_http_connections_waiting

# Request duration (via logs com mtail)
nginx_http_request_duration_seconds_sum / nginx_http_request_duration_seconds_count
```

### Alertas Recomendados

```yaml
- alert: NginxDown
  expr: up{job="nginx"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Nginx is down"

- alert: NginxHighConnections
  expr: nginx_http_connections_active > 1000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High number of active connections on Nginx"
```

---

## 7. Docker Containers

### cAdvisor (Já incluído)

### Queries PromQL

```promql
# CPU por container
rate(container_cpu_usage_seconds_total{name!=""}[5m]) * 100

# Memória por container (MB)
container_memory_usage_bytes{name!=""} / 1024 / 1024

# Memory limit (%)
(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100

# Network RX (MB/s)
rate(container_network_receive_bytes_total{name!=""}[5m]) / 1024 / 1024

# Network TX (MB/s)
rate(container_network_transmit_bytes_total{name!=""}[5m]) / 1024 / 1024

# Disk read (MB/s)
rate(container_fs_reads_bytes_total{name!=""}[5m]) / 1024 / 1024

# Disk write (MB/s)
rate(container_fs_writes_bytes_total{name!=""}[5m]) / 1024 / 1024

# Containers por estado
count(container_last_seen{name!=""}) by (image)
```

### Alertas Recomendados

```yaml
- alert: ContainerDown
  expr: time() - container_last_seen{name!=""} > 60
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Container {{ $labels.name }} is down"

- alert: ContainerHighCPU
  expr: rate(container_cpu_usage_seconds_total{name!=""}[5m]) * 100 > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High CPU on container {{ $labels.name }}"

- alert: ContainerHighMemory
  expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100 > 90
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High memory usage on container {{ $labels.name }}"

- alert: ContainerOOMKilled
  expr: increase(container_oom_events_total[5m]) > 0
  labels:
    severity: critical
  annotations:
    summary: "Container {{ $labels.name }} was OOM killed"

- alert: ContainerRestartLoop
  expr: rate(container_start_time_seconds{name!=""}[10m]) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Container {{ $labels.name }} is restarting frequently"
```

---

## 8. TheHive, MISP, Cortex

### Monitoramento via Health Checks

```yaml
# blackbox_exporter config
modules:
  http_thehive:
    prober: http
    http:
      valid_status_codes: [200]
      method: GET
      headers:
        Authorization: "Bearer TOKEN"

# Prometheus scrape
- job_name: 'blackbox-soar'
  metrics_path: /probe
  params:
    module: [http_thehive]
  static_configs:
    - targets:
        - https://thehive.empresa.local/api/status
        - https://misp.empresa.local/users/view/me.json
        - https://cortex.empresa.local/api/status
```

### Métricas Customizadas (via API)

```python
# soar_exporter.py

import requests
from prometheus_client import Gauge, CollectorRegistry, generate_latest
from flask import Flask, Response

registry = CollectorRegistry()

# TheHive
thehive_cases_open = Gauge('thehive_cases_open', 'Open cases', registry=registry)
thehive_cases_new_24h = Gauge('thehive_cases_new_last_24h', 'New cases (24h)', registry=registry)
thehive_alerts_pending = Gauge('thehive_alerts_pending', 'Pending alerts', registry=registry)

# MISP
misp_events_total = Gauge('misp_events_total', 'Total events', registry=registry)
misp_events_last_24h = Gauge('misp_events_last_24h', 'Events (24h)', registry=registry)

# Cortex
cortex_jobs_running = Gauge('cortex_jobs_running', 'Running jobs', registry=registry)
cortex_jobs_queued = Gauge('cortex_jobs_queued', 'Queued jobs', registry=registry)

def collect_thehive():
    response = requests.get(
        'https://thehive.empresa.local/api/case',
        headers={'Authorization': 'Bearer TOKEN'},
        params={'query': {'status': 'Open'}},
        verify=False
    )
    thehive_cases_open.set(len(response.json()))
    # ... mais métricas

def collect_misp():
    response = requests.get(
        'https://misp.empresa.local/events/index',
        headers={'Authorization': 'API_KEY'},
        verify=False
    )
    misp_events_total.set(len(response.json()))

def collect_cortex():
    response = requests.get(
        'https://cortex.empresa.local/api/job',
        headers={'Authorization': 'Bearer TOKEN'},
        params={'query': {'status': 'Running'}},
        verify=False
    )
    cortex_jobs_running.set(len(response.json()))

app = Flask(__name__)

@app.route('/metrics')
def metrics():
    collect_thehive()
    collect_misp()
    collect_cortex()
    return Response(generate_latest(registry), mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9095)
```

---

## Capacity Planning

### Métricas de Tendência

```promql
# CPU growth rate (últimos 7 dias)
delta(
  avg_over_time(instance:node_cpu_utilisation:rate5m[7d])
)

# Memory growth rate
delta(
  avg_over_time(instance:node_memory_utilisation:ratio[7d])
)

# Disk growth rate (GB/dia)
(
  node_filesystem_size_bytes - node_filesystem_avail_bytes
) / 1024 / 1024 / 1024

# Projeção de esgotamento de disco
predict_linear(node_filesystem_avail_bytes[7d], 30*24*3600) < 0
```

### Dashboard de Capacity Planning

```yaml
Panels:
  - CPU Trend (7d, 30d)
  - Memory Trend (7d, 30d)
  - Disk Usage Forecast (quando vai encher?)
  - Database Size Growth
  - Request Rate Growth
  - Connection Pool Usage Trend
```

---

## Troubleshooting Guiado por Métricas

### Cenário 1: Latência Alta

```
1. Verificar onde está a latência:
   - probe_http_duration_seconds (endpoint)
   - http_request_duration_seconds (app)
   - pg_stat_statements_max_exec_time (database)

2. Se latência no app:
   - Verificar CPU (rate limiter?)
   - Verificar memória (GC pauses?)
   - Verificar workers (todos ocupados?)

3. Se latência no database:
   - Verificar slow queries
   - Verificar locks (pg_locks_count)
   - Verificar cache hit ratio

4. Se latência na rede:
   - Verificar bandwidth
   - Verificar packet loss
   - Verificar DNS resolution time
```

### Cenário 2: Alto Uso de Memória

```
1. Identificar processo:
   - container_memory_usage_bytes (por container)
   - node_memory_MemAvailable_bytes (host)
   - process_resident_memory_bytes (por processo)

2. Se container:
   - Verificar limits configurados
   - Verificar memory leak (tendência crescente)
   - Verificar logs para OOM

3. Se PostgreSQL:
   - Verificar shared_buffers, work_mem
   - Verificar conexões abertas
   - Verificar queries com sorts grandes

4. Se Redis:
   - Verificar redis_memory_used_bytes
   - Verificar eviction policy
   - Verificar keys sem TTL
```

---

**Autor:** Equipe NEO_NETBOX_ODOO Stack
**Última Atualização:** 2025-12-05
**Versão:** 1.0
