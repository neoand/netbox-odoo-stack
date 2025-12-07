# API Reference - Analytics Platform

## Visión General

La **Analytics Platform** es una plataforma completa de analytics en tiempo real que procesa datos de múltiples fuentes (NetBox, Wazuh, Odoo, TheHive) y proporciona insights accionables a través de dashboards interactivos y modelos de machine learning predictivos. Incluye 3 modelos ML (Anomaly Detection, Capacity Forecasting, Incident Prediction) y 6 dashboards especializados.

### Información Base

- **Versión de la API**: v3.0
- **ML Models API**: `https://analytics.platform.local:8001/api/v3`
- **Analytics API Gateway**: `https://analytics.platform.local:8002/api/v3`
- **Protocolo**: HTTPS obligatorio
- **Formato**: JSON

---

## Autenticación

### JWT Bearer Token

```http
Authorization: Bearer <jwt_token>
```

### Headers Obligatorios

```http
Content-Type: application/json
X-Tenant-ID: <tenant_id>
```

---

## ML Models API (Port 8001)

### Health Check

#### GET /api/v3/health

##### Response

**200 OK** - Servicios saludables

```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T10:30:00Z",
  "version": "3.0.0",
  "models": {
    "anomaly_detection": "loaded",
    "capacity_forecasting": "loaded",
    "incident_prediction": "loaded"
  }
}
```

##### Ejemplo cURL

```bash
curl -X GET https://analytics.platform.local:8001/api/v3/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Anomaly Detection

#### POST /api/v3/anomaly-detection

**Método**: POST
**URL**: `/api/v3/anomaly-detection`
**Autenticación**: Bearer Token

##### Parámetros

**Body** (application/json):

```json
{
  "device_id": "string",
  "metrics": {
    "cpu": "number",
    "memory": "number",
    "disk": "number",
    "network_in": "number",
    "network_out": "number",
    "temperature": "number"
  },
  "timestamp": "string"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| device_id | string | Sí | ID del dispositivo |
| metrics | object | Sí | Métricas del dispositivo |
| timestamp | string | No | Timestamp (predeterminado: ahora) |

##### Response

**200 OK** - Resultado de detección

```json
{
  "device_id": "srv-001",
  "timestamp": "2025-12-06T10:30:00Z",
  "anomaly_score": 0.89,
  "is_anomaly": true,
  "anomaly_type": "cpu_spike",
  "confidence": 0.95,
  "recommended_action": "investigate_processes",
  "details": {
    "metric": "cpu",
    "expected_value": 45.2,
    "actual_value": 85.5,
    "deviation": "3.2_sigma"
  }
}
```

##### Ejemplo cURL

```bash
curl -X POST https://analytics.platform.local:8001/api/v3/anomaly-detection \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "srv-001",
    "metrics": {
      "cpu": 85.5,
      "memory": 72.3,
      "disk": 45.2,
      "network_in": 1024,
      "network_out": 2048,
      "temperature": 68.5
    }
  }'
```

---

### Capacity Forecasting

#### GET /api/v3/capacity-forecast/{device_id}

**Método**: GET
**URL**: `/api/v3/capacity-forecast/{device_id}`
**Autenticación**: Bearer Token

##### Parámetros

**Path**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| device_id | string | Sí | ID del dispositivo |

**Query String**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| days | integer | No | Días de pronóstico (predeterminado: 30, máximo: 90) |
| resource_type | string | No | Tipo de recurso (cpu, memory, disk, predeterminado: cpu) |

##### Response

**200 OK** - Pronóstico de capacidad

```json
{
  "device_id": "srv-001",
  "resource_type": "cpu",
  "forecast_horizon": 30,
  "forecast": [
    {
      "date": "2025-12-07",
      "predicted_utilization": 0.72,
      "confidence_interval": [0.68, 0.76],
      "trend": "increasing"
    },
    {
      "date": "2025-12-08",
      "predicted_utilization": 0.75,
      "confidence_interval": [0.70, 0.80],
      "trend": "increasing"
    }
  ],
  "recommendation": "schedule_maintenance",
  "days_to_capacity": 12,
  "confidence": 0.90,
  "last_updated": "2025-12-06T02:00:00Z"
}
```

##### Ejemplo cURL

```bash
curl -X GET "https://analytics.platform.local:8001/api/v3/capacity-forecast/srv-001?days=30&resource_type=cpu" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Incident Prediction

#### GET /api/v3/incident-prediction

**Método**: GET
**URL**: `/api/v3/incident-prediction`
**Autenticación**: Bearer Token

##### Parámetros

**Query String**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| days | integer | No | Días de pronóstico (predeterminado: 7, máximo: 30) |

##### Response

**200 OK** - Predicción de incidentes

```json
{
  "prediction_date": "2025-12-06",
  "prediction_window": 7,
  "overall_risk_score": 0.72,
  "risk_level": "high",
  "predictions": [
    {
      "incident_type": "data_breach",
      "probability": 0.72,
      "risk_level": "high",
      "expected_date": "2025-12-10",
      "confidence": 0.80
    },
    {
      "incident_type": "ddos_attack",
      "probability": 0.45,
      "risk_level": "medium",
      "expected_date": "2025-12-08",
      "confidence": 0.75
    }
  ],
  "contributing_factors": [
    "unusual_data_access",
    "multiple_failed_logins",
    "vulnerability_cve_2024_1234"
  ],
  "recommended_actions": [
    "patch_cve_2024_1234",
    "enable_mfa",
    "review_access_logs",
    "increase_monitoring"
  ],
  "last_updated": "2025-12-06T02:00:00Z"
}
```

##### Ejemplo cURL

```bash
curl -X GET "https://analytics.platform.local:8001/api/v3/incident-prediction?days=7" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Analytics API Gateway (Port 8002)

### Dashboards

#### GET /api/v3/dashboards/executive

**Método**: GET
**URL**: `/api/v3/dashboards/executive`
**Autenticación**: Bearer Token

##### Parámetros

Ninguno.

##### Response

**200 OK** - Dashboard ejecutivo

```json
{
  "dashboard": "executive",
  "timestamp": "2025-12-06T10:30:00Z",
  "metrics": {
    "system_health_score": 95,
    "security_incidents": 3,
    "capacity_utilization": 68,
    "sla_compliance": 99.5,
    "cost_optimization_savings": 12500,
    "active_tenants": 42,
    "total_users": 1240,
    "api_requests_24h": 456789
  },
  "alerts": [
    {
      "id": "alert-001",
      "severity": "warning",
      "message": "Uso de CPU por encima del 80% en srv-001",
      "timestamp": "2025-12-06T10:25:00Z"
    }
  ],
  "trends": {
    "capacity_trend": "increasing",
    "cost_trend": "decreasing",
    "security_trend": "stable"
  }
}
```

##### Ejemplo cURL

```bash
curl -X GET https://analytics.platform.local:8002/api/v3/dashboards/executive \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/dashboards/infrastructure

##### Response

**200 OK** - Dashboard de infraestructura

```json
{
  "dashboard": "infrastructure",
  "timestamp": "2025-12-06T10:30:00Z",
  "devices": {
    "total": 125,
    "up": 118,
    "down": 2,
    "degraded": 5
  },
  "metrics": {
    "avg_cpu_utilization": 45.2,
    "avg_memory_utilization": 62.8,
    "avg_disk_utilization": 55.3,
    "avg_network_latency": 12.5
  },
  "top_devices": [
    {
      "device_id": "srv-001",
      "cpu": 85.5,
      "status": "degraded"
    }
  ]
}
```

#### GET /api/v3/dashboards/security

##### Response

**200 OK** - Dashboard de seguridad

```json
{
  "dashboard": "security",
  "timestamp": "2025-12-06T10:30:00Z",
  "metrics": {
    "threats_detected": 15,
    "incidents_open": 3,
    "incidents_resolved": 42,
    "false_positives": 5,
    "mean_time_to_detect": 15,
    "mean_time_to_respond": 45
  },
  "top_threats": [
    {
      "type": "malware",
      "count": 8,
      "severity": "high"
    }
  ]
}
```

#### GET /api/v3/dashboards/tickets

##### Response

**200 OK** - Dashboard de tickets

```json
{
  "dashboard": "tickets",
  "timestamp": "2025-12-06T10:30:00Z",
  "metrics": {
    "total_open": 45,
    "total_closed": 245,
    "sla_compliance": 94.5,
    "avg_resolution_time": 4.2,
    "customer_satisfaction": 4.6
  },
  "by_priority": {
    "critical": 3,
    "high": 12,
    "medium": 20,
    "low": 10
  }
}
```

#### GET /api/v3/dashboards/network

##### Response

**200 OK** - Dashboard de red

```json
{
  "dashboard": "network",
  "timestamp": "2025-12-06T10:30:00Z",
  "metrics": {
    "total_bandwidth": 10000,
    "utilized_bandwidth": 4250,
    "packet_loss": 0.02,
    "avg_latency": 12.5,
    "jitter": 2.3
  },
  "top_talkers": [
    {
      "ip": "192.168.1.100",
      "traffic_in": 1024,
      "traffic_out": 2048
    }
  ]
}
```

#### GET /api/v3/dashboards/capacity

##### Response

**200 OK** - Dashboard de capacidad

```json
{
  "dashboard": "capacity",
  "timestamp": "2025-12-06T10:30:00Z",
  "metrics": {
    "avg_capacity_utilization": 68.5,
    "projected_capacity_exhaustion": 45,
    "upgrade_recommendations": 5,
    "cost_of_not_upgrading": 12500
  },
  "by_resource": {
    "cpu": {
      "current": 68.5,
      "30_day_forecast": 78.2,
      "days_to_capacity": 30
    },
    "memory": {
      "current": 72.3,
      "30_day_forecast": 85.5,
      "days_to_capacity": 20
    }
  }
}
```

### Time-Series Data

#### GET /api/v3/timeseries

**Método**: GET
**URL**: `/api/v3/timeseries`
**Autenticación**: Bearer Token

##### Parámetros

**Query String**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| device_id | string | Sí | ID del dispositivo |
| metric | string | Sí | Nombre de la métrica (cpu, memory, disk, network) |
| start | string | Sí | Fecha inicial (ISO 8601) |
| end | string | Sí | Fecha final (ISO 8601) |
| interval | string | No | Intervalo (1m, 5m, 1h, 1d, predeterminado: 1h) |

##### Response

**200 OK** - Datos de serie temporal

```json
{
  "device_id": "srv-001",
  "metric": "cpu",
  "start": "2025-12-01T00:00:00Z",
  "end": "2025-12-06T00:00:00Z",
  "interval": "1h",
  "data_points": [
    {
      "timestamp": "2025-12-01T00:00:00Z",
      "value": 45.2
    },
    {
      "timestamp": "2025-12-01T01:00:00Z",
      "value": 47.8
    }
  ],
  "statistics": {
    "min": 35.2,
    "max": 89.5,
    "avg": 56.3,
    "p95": 78.4
  }
}
```

##### Ejemplo cURL

```bash
curl -X GET "https://analytics.platform.local:8002/api/v3/timeseries?device_id=srv-001&metric=cpu&start=2025-12-01T00:00:00Z&end=2025-12-06T00:00:00Z&interval=1h" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Códigos de Error

### Códigos HTTP

| Código | Descripción |
|--------|-------------|
| **200** | OK - Éxito |
| **201** | Created - Creado |
| **400** | Bad Request - Parámetros inválidos |
| **401** | Unauthorized - No autenticado |
| **403** | Forbidden - Sin permisos |
| **404** | Not Found - Recurso no encontrado |
| **422** | Unprocessable Entity - Datos inválidos |
| **429** | Too Many Requests - Rate limit |
| **500** | Internal Server Error - Error interno |
| **503** | Service Unavailable - Servicio no disponible |

### Errores Específicos

| Código | Error | Descripción |
|--------|-------|-------------|
| **2001** | model_not_loaded | Modelo ML no cargado |
| **2002** | prediction_failed | Falla en la predicción |
| **2003** | invalid_metric | Métrica inválida |
| **2004** | insufficient_data | Datos insuficientes |
| **2005** | etl_failed | Falla en ETL |
| **2006** | source_unavailable | Fuente de datos no disponible |

---

## Soporte

- **Dashboard UI**: https://analytics.platform.local:3005
- **Jupyter Notebook**: https://analytics.platform.local:8888
- **Email**: analytics-support@platform.local

---

**Versión**: 3.0.0
**Última Actualización**: 06 de Diciembre de 2025
