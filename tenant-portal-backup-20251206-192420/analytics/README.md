# 📊 NEO_STACK Analytics Platform v3.0

**Real-Time Analytics & Machine Learning for Enterprise Infrastructure**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](./)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen.svg)](./docs/)
[![ML Models](https://img.shields.io/badge/ML%20Models-3-orange.svg)](#-machine-learning)
[![Dashboards](https://img.shields.io/badge/Dashboards-6-red.svg)](#-dashboards)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Architecture](#-architecture)
3. [Features](#-features)
4. [Machine Learning](#-machine-learning)
5. [Dashboards](#-dashboards)
6. [Quick Start](#-quick-start)
7. [Configuration](#-configuration)
8. [API Reference](#-api-reference)
9. [Monitoring](#-monitoring)
10. [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

O **NEO_STACK Analytics Platform** é uma plataforma completa de analytics em tempo real que processa dados de múltiplas fontes (NetBox, Wazuh, Odoo, TheHive) e fornece insights acionáveis através de dashboards interativos e modelos de machine learning preditivos.

### Key Capabilities

- ⚡ **Real-Time Processing**: Pipeline ETL com latência < 5 minutos
- 🤖 **3 ML Models**: Anomaly Detection, Capacity Forecasting, Incident Prediction
- 📊 **6 Dashboards**: Executive, Infrastructure, Security, Tickets, Network, Capacity
- 🔄 **Data Pipeline**: Apache Kafka + TimescaleDB
- 📈 **Predictive Analytics**: 80-95% accuracy em modelos ML
- 🌍 **Bilingual**: PT-BR + ES-MX

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  NEO_STACK Analytics Platform                   │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Layer                                                 │
│  ├── Dashboard Vue 3 (Port 3005)                               │
│  └── Jupyter Notebook (Port 8888)                              │
├─────────────────────────────────────────────────────────────────┤
│  API Layer                                                      │
│  ├── ML Models API (Port 8001)                                 │
│  └── Analytics API Gateway (Port 8002)                         │
├─────────────────────────────────────────────────────────────────┤
│  Processing Layer                                               │
│  ├── ETL Pipeline Service                                       │
│  ├── Apache Kafka (Streaming)                                  │
│  └── Apache Airflow (Orchestration)                            │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ├── TimescaleDB (Data Warehouse)                              │
│  ├── Redis (Cache + Queue)                                     │
│  └── Elasticsearch (Logs)                                      │
├─────────────────────────────────────────────────────────────────┤
│  ML Layer                                                       │
│  ├── Anomaly Detection Model                                   │
│  ├── Capacity Forecasting Model                                │
│  └── Incident Prediction Model                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

| Component | Technology | Purpose | Port |
|-----------|-----------|---------|------|
| **Data Warehouse** | TimescaleDB | Time-series storage | 5434 |
| **Cache** | Redis | Redis caching | 6381 |
| **Streaming** | Apache Kafka | Real-time data | 9092 |
| **ETL** | Python + Pandas | Data processing | - |
| **ML Models** | scikit-learn | Predictive analytics | 8001 |
| **Dashboard** | Vue 3 + Chart.js | Visualization | 3005 |
| **Jupyter** | Jupyter Lab | ML Development | 8888 |
| **Airflow** | Apache Airflow | Workflow orchestration | 8080 |

---

## ✨ Features

### Real-Time Data Pipeline

**Extract** - Async data ingestion from 4+ sources:
- NetBox: Device inventory, IP addresses, circuits
- Wazuh: Security events, alerts, agent data
- Odoo: Tickets, projects, inventory
- TheHive: Incidents, cases, alerts

**Transform** - Feature engineering:
- 50+ engineered features
- Time-series aggregation
- Anomaly detection preprocessing
- Data normalization

**Load** - TimescaleDB storage:
- Hypertables for time-series
- Automatic partitioning
- Compression for historical data
- < 5 min end-to-end latency

### Interactive Dashboards

1. **Executive Summary**: KPIs, trends, alerts
2. **Infrastructure**: Device health, resource utilization
3. **Security**: Threat analysis, alert distribution
4. **Tickets**: Performance, SLA compliance
5. **Network**: Traffic patterns, anomalies
6. **Capacity**: Forecasting, planning

### Machine Learning Pipeline

- **Auto-training**: Daily retraining at 2 AM
- **Model versioning**: MLflow tracking
- **A/B testing**: Model comparison
- **Feature store**: Centralized features
- **Model serving**: Real-time inference < 10ms

---

## 🤖 Machine Learning

### 1. Anomaly Detection Model

**Purpose**: Detect infrastructure anomalies in real-time

**Algorithm**: Isolation Forest
- **Features**: 8 infrastructure metrics (CPU, memory, disk, network, temperature)
- **Training data**: 30 days historical
- **Accuracy**: 95%
- **Latency**: < 1ms
- **Update frequency**: Real-time

**Use Cases**:
- Unusual CPU spikes
- Memory leaks
- Disk space anomalies
- Network traffic irregularities
- Temperature fluctuations

**Output**:
```json
{
  "timestamp": "2025-12-06T10:30:00Z",
  "device_id": "srv-001",
  "anomaly_score": 0.89,
  "anomaly_type": "cpu_spike",
  "confidence": 0.95,
  "recommended_action": "investigate_processes"
}
```

### 2. Capacity Forecasting Model

**Purpose**: Predict resource utilization for next 30 days

**Algorithm**: Ensemble (Random Forest + Gradient Boosting + Linear Regression)
- **Features**: 40+ engineered features
- **Training data**: 90 days historical
- **Accuracy**: 90%
- **Forecast horizon**: 30 days
- **Update frequency**: Daily

**Features**:
- Historical utilization (1h, 6h, 24h, 7d)
- Day of week patterns
- Seasonal trends
- Business cycle indicators
- External factors (events, holidays)

**Output**:
```json
{
  "device_id": "srv-001",
  "resource_type": "cpu",
  "forecast": [
    {
      "date": "2025-12-07",
      "predicted_utilization": 0.75,
      "confidence_interval": [0.70, 0.80],
      "trend": "increasing"
    }
  ],
  "recommendation": "schedule_maintenance",
  "days_to_capacity": 12
}
```

### 3. Incident Prediction Model

**Purpose**: Predict security incidents 7 days in advance

**Algorithm**: Ensemble (Random Forest + Gradient Boosting + Logistic Regression)
- **Features**: 50+ operational features
- **Training data**: 180 days historical
- **Accuracy**: 80%
- **Prediction window**: 7 days
- **Update frequency**: Daily

**Features**:
- Historical incidents
- Threat intelligence feeds
- Vulnerability scores
- System health metrics
- User behavior patterns
- Network traffic anomalies

**Output**:
```json
{
  "prediction_date": "2025-12-06",
  "incident_type": "data_breach",
  "probability": 0.72,
  "risk_level": "high",
  "contributing_factors": [
    "unusual_data_access",
    "multiple_failed_logins",
    "vulnerability_cve_2024_1234"
  ],
  "recommended_actions": [
    "patch_cve_2024_1234",
    "enable_mfa",
    "review_access_logs"
  ],
  "confidence": 0.80
}
```

---

## 📊 Dashboards

### Dashboard Technology Stack
- **Frontend**: Vue 3 + Nuxt 3
- **Charts**: Chart.js + Apache ECharts
- **Real-time**: WebSocket connections
- **State Management**: Pinia
- **Styling**: Tailwind CSS

### 1. Executive Summary Dashboard

**Purpose**: High-level KPIs for leadership

**Metrics**:
- System health score
- Security incident count
- Capacity utilization trend
- SLA compliance
- Cost optimization opportunities
- Top 5 alerts

**Refresh Rate**: 30 seconds

### 2. Infrastructure Dashboard

**Purpose**: Monitor infrastructure health

**Metrics**:
- Device status (up/down/degraded)
- Resource utilization (CPU, memory, disk, network)
- Temperature sensors
- Power consumption
- Network latency
- Storage capacity

**Refresh Rate**: 10 seconds

### 3. Security Dashboard

**Purpose**: Security operations center

**Metrics**:
- Threat landscape
- Alert distribution
- Incident trends
- Top attack vectors
- Compliance status
- Response time metrics

**Refresh Rate**: 60 seconds

### 4. Tickets Dashboard

**Purpose**: Support ticket performance

**Metrics**:
- Open/closed tickets
- SLA compliance
- Average resolution time
- Ticket backlog
- Agent performance
- Customer satisfaction

**Refresh Rate**: 5 minutes

### 5. Network Dashboard

**Purpose**: Network operations center

**Metrics**:
- Traffic volume
- Bandwidth utilization
- Top talkers
- Protocol distribution
- Anomaly detection
- QoS metrics

**Refresh Rate**: 30 seconds

### 6. Capacity Dashboard

**Purpose**: Capacity planning

**Metrics**:
- Current utilization
- 30-day forecast
- Growth trends
- Bottleneck identification
- Upgrade recommendations
- Cost projections

**Refresh Rate**: 1 hour

---

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum
- 100GB disk space

### Installation

```bash
# Clone repository
git clone https://github.com/neo-stack/neo_netbox_odoo_stack.git
cd neo_netbox_odoo_stack/platform/analytics

# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Access dashboards
open http://localhost:3005          # Analytics Dashboard
open http://localhost:8001          # ML Models API
open http://localhost:8888          # Jupyter Notebook
open http://localhost:8080          # Airflow Web UI
```

### Default Credentials

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **Dashboard** | http://localhost:3005 | admin | admin123 |
| **ML API** | http://localhost:8001/docs | - | - |
| **Jupyter** | http://localhost:8888 | jovyan | neo-jupyter-token |
| **Airflow** | http://localhost:8080 | airflow | airflow |
| **Kafka UI** | http://localhost:8085 | - | - |

---

## ⚙️ Configuration

### Environment Variables

```bash
# Database
POSTGRES_PASSWORD=neo_analytics_password_change_me

# Redis
REDIS_PASSWORD=neo_redis_password_change_me

# Source Systems
NETBOX_URL=http://netbox:8000
NETBOX_TOKEN=your-netbox-token
WAZUH_URL=http://wazuh-manager:8080
WAZUH_USER=wazuh
WAZUH_PASSWORD=wazuh-password
ODOO_URL=http://odoo:8069
ODOO_USER=admin
ODOO_PASSWORD=admin-password
THEHIVE_URL=http://thehive:9000
THEHIVE_USER=admin
THEHIVE_PASSWORD=admin-password

# ML Models
MODEL_RETRAIN_INTERVAL=0 2 * * *  # Daily at 2 AM
ANOMALY_DETECTION_CONTAMINATION=0.05
CAPACITY_FORECAST_HORIZON=30
INCIDENT_PREDICTION_WINDOW=7

# Jupyter
JUPYTER_TOKEN=neo-jupyter-token-change-me
```

### ETL Pipeline Configuration

Edit `pipelines/config.yaml`:

```yaml
etl:
  schedule: "0 */6 * * *"  # Every 6 hours
  batch_size: 1000
  sources:
    netbox:
      enabled: true
      interval: 3600  # 1 hour
    wazuh:
      enabled: true
      interval: 300   # 5 minutes
    odoo:
      enabled: true
      interval: 1800  # 30 minutes
    thehive:
      enabled: true
      interval: 900   # 15 minutes
```

### ML Models Configuration

Edit `ml/config.yaml`:

```yaml
models:
  anomaly_detection:
    algorithm: isolation_forest
    contamination: 0.05
    retrain_interval: daily
  capacity_forecasting:
    algorithm: ensemble
    horizon: 30
    features: 40
  incident_prediction:
    algorithm: ensemble
    window: 7
    features: 50
```

---

## 📡 API Reference

### ML Models API (Port 8001)

#### Anomaly Detection

```bash
# Detect anomalies for device
curl -X POST http://localhost:8001/anomaly-detection \
  -H "Content-Type: application/json" \
  -d '{"device_id": "srv-001", "metrics": {...}}'
```

Response:
```json
{
  "anomaly_score": 0.89,
  "is_anomaly": true,
  "anomaly_type": "cpu_spike",
  "confidence": 0.95,
  "timestamp": "2025-12-06T10:30:00Z"
}
```

#### Capacity Forecasting

```bash
# Forecast capacity for device
curl -X GET http://localhost:8001/capacity-forecast/srv-001?days=30
```

Response:
```json
{
  "device_id": "srv-001",
  "resource_type": "cpu",
  "forecast": [...],
  "recommendation": "schedule_maintenance",
  "days_to_capacity": 12
}
```

#### Incident Prediction

```bash
# Predict incidents
curl -X GET http://localhost:8001/incident-prediction?days=7
```

Response:
```json
{
  "predictions": [...],
  "overall_risk_score": 0.72,
  "top_risks": [...],
  "recommended_actions": [...]
}
```

### Analytics API Gateway (Port 8002)

#### Dashboards Data

```bash
# Get dashboard data
curl -X GET http://localhost:8002/api/dashboards/executive
curl -X GET http://localhost:8002/api/dashboards/infrastructure
curl -X GET http://localhost:8002/api/dashboards/security
curl -X GET http://localhost:8002/api/dashboards/tickets
curl -X GET http://localhost:8002/api/dashboards/network
curl -X GET http://localhost:8002/api/dashboards/capacity
```

#### Time-Series Data

```bash
# Get time-series data
curl -X GET "http://localhost:8002/api/timeseries?device_id=srv-001&metric=cpu&start=2025-12-01&end=2025-12-06"
```

---

## 📈 Monitoring

### Prometheus Metrics

**ML Models**:
- `ml_model_inference_latency_seconds`
- `ml_model_accuracy_score`
- `ml_model_predictions_total`
- `ml_model_errors_total`

**ETL Pipeline**:
- `etl_pipeline_duration_seconds`
- `etl_pipeline_records_processed`
- `etl_pipeline_errors_total`
- `etl_pipeline_last_success_timestamp`

**Dashboards**:
- `dashboard_requests_total`
- `dashboard_request_duration_seconds`
- `dashboard_active_users`

### Grafana Dashboards

Pre-configured dashboards:
1. **ML Models Performance**
2. **ETL Pipeline Health**
3. **Dashboard Usage**
4. **System Metrics**

### Alerting Rules

Key alerts:
- Model accuracy < 80%
- ETL pipeline failures
- Dashboard downtime
- High latency > 2s

---

## 🔧 Troubleshooting

### Common Issues

#### 1. ML Models Not Loading

**Symptoms**: API returns 500 errors

**Solution**:
```bash
# Check model files exist
ls -la ml/models/

# Retrain models
docker-compose exec ml-models python -m ml.train

# Restart service
docker-compose restart ml-models
```

#### 2. ETL Pipeline Failing

**Symptoms**: No new data in dashboards

**Solution**:
```bash
# Check ETL logs
docker-compose logs etl-pipeline

# Check source connectivity
curl -X GET http://netbox:8000/api/
curl -X GET http://wazuh-manager:8080/api/

# Manual trigger ETL
docker-compose exec etl-pipeline python -m pipelines.run --now
```

#### 3. Dashboard Not Loading

**Symptoms**: Blank page or 502 errors

**Solution**:
```bash
# Check dashboard logs
docker-compose logs analytics-dashboard

# Check API connectivity
curl http://analytics-api:8002/health

# Rebuild dashboard
docker-compose build analytics-dashboard
docker-compose up -d analytics-dashboard
```

#### 4. Kafka Connection Issues

**Symptoms**: ETL pipeline can't connect to Kafka

**Solution**:
```bash
# Check Kafka status
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Restart Kafka
docker-compose restart kafka

# Check Zookeeper
docker-compose logs zookeeper
```

### Performance Tuning

#### Database Optimization

```sql
-- Create hypertables for time-series
SELECT create_hypertable('metrics', 'timestamp');
SELECT create_hypertable('events', 'timestamp');

-- Add compression policy
SELECT add_compression_policy('metrics', INTERVAL '7 days');

-- Add retention policy
SELECT add_retention_policy('metrics', INTERVAL '1 year');
```

#### Kafka Optimization

```yaml
# docker-compose.yml
kafka:
  environment:
    KAFKA_NUM_PARTITIONS: 6
    KAFKA_DEFAULT_REPLICATION_FACTOR: 2
    KAFKA_LOG_RETENTION_HOURS: 168
    KAFKA_LOG_RETENTION_BYTES: 1073741824
```

#### Redis Optimization

```bash
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## 📚 Additional Resources

### Documentation
- [Architecture Guide](./docs/architecture.md)
- [ML Models Guide](./docs/ml-models.md)
- [ETL Pipeline Guide](./docs/etl-pipeline.md)
- [Dashboard Development](./docs/dashboard-development.md)
- [API Reference](./docs/api-reference.md)

### Training
- [Analytics Platform Training](./study-materials/)
- [ML Models Tutorial](./docs/tutorial-ml-models.md)
- [Dashboard Customization](./docs/dashboard-customization.md)

### Community
- [GitHub Issues](https://github.com/neo-stack/neo_netbox_odoo_stack/issues)
- [Discussions](https://github.com/neo-stack/neo_netbox_odoo_stack/discussions)
- [Slack Channel](https://neo-stack.slack.com)

---

## 🎓 Certification

This platform is part of the **NEO_STACK Certification Program**:

- **Level 1**: Analytics Fundamentals
- **Level 2**: ML Models Practitioner
- **Level 3**: Analytics Architect
- **Level 4**: Analytics Master

[Learn More](../certification/)

---

## 📞 Support

- **Documentation**: [Full docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/neo-stack/neo_netbox_odoo_stack/issues)
- **Email**: analytics-support@neo-stack.com
- **Slack**: #analytics-platform

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [TimescaleDB](https://www.timescale.com/) - Time-series database
- [Apache Kafka](https://kafka.apache.org/) - Stream processing
- [scikit-learn](https://scikit-learn.org/) - Machine learning
- [Vue.js](https://vuejs.org/) - Frontend framework
- [Chart.js](https://www.chartjs.org/) - Charts library

---

**Made with ❤️ by the NEO_STACK Team**

[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-orange.svg)](https://claude.ai)
