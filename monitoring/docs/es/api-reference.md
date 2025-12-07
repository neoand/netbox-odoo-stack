# API Reference - Monitoring Service

## Visión General

El **Monitoring Service** es responsable de la observabilidad completa de la plataforma NEO_STACK v3.0. Recopila métricas, logs y traces de todos los microservices, proporcionando dashboards en tiempo real, alerting y analytics usando Prometheus + Grafana + AlertManager.

### Información Base

- **Versión de la API**: v3.0
- **URL Base**: `https://monitoring.platform.local/api/v3`
- **Protocolo**: HTTPS obligatorio
- **Formato**: JSON

---

## Autenticación

### JWT Bearer Token

```http
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Health Check

#### GET /api/v3/health

##### Response

**200 OK**

```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T10:30:00Z",
  "prometheus": "healthy",
  "grafana": "healthy",
  "alertmanager": "healthy"
}
```

---

### Métricas

#### GET /api/v3/metrics

**Método**: GET
**URL**: `/api/v3/metrics`
**Autenticación**: Bearer Token

##### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| service | string | No | Filtrar por servicio |
| metric | string | No | Filtrar por métrica |
| start | string | No | Fecha inicial |
| end | string | No | Fecha final |

##### Response

**200 OK**

```json
{
  "timestamp": "2025-12-06T10:30:00Z",
  "metrics": [
    {
      "service": "api-gateway",
      "metric": "http_requests_total",
      "value": 12345,
      "labels": {
        "method": "GET",
        "status": "200"
      }
    }
  ],
  "summary": {
    "total_requests": 12345,
    "error_rate": 0.02,
    "avg_response_time": 0.085
  }
}
```

##### Ejemplo cURL

```bash
curl -X GET "https://monitoring.platform.local/api/v3/metrics?service=api-gateway" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Dashboards

#### GET /api/v3/dashboards/{dashboard_name}

**Método**: GET
**URL**: `/api/v3/dashboards/{dashboard_name}`
**Autenticación**: Bearer Token

##### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| dashboard_name | string | Sí | Nombre del dashboard |

##### Response

**200 OK**

```json
{
  "dashboard_name": "platform-overview",
  "timestamp": "2025-12-06T10:30:00Z",
  "panels": [
    {
      "title": "System Health",
      "type": "stat",
      "value": 95,
      "unit": "%",
      "status": "ok"
    },
    {
      "title": "Request Rate",
      "type": "graph",
      "data": [
        {
          "timestamp": "2025-12-06T09:00:00Z",
          "value": 1250
        }
      ]
    }
  ]
}
```

##### Dashboards Disponibles

- platform-overview
- api-gateway
- auth-service
- tenant-manager
- infrastructure

---

### Alertas

#### GET /api/v3/alerts

**Método**: GET
**URL**: `/api/v3/alerts`
**Autenticación**: Bearer Token

##### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| severity | string | No | Filtrar por severidad |
| status | string | No | Filtrar por estado |
| service | string | No | Filtrar por servicio |

##### Response

**200 OK**

```json
{
  "alerts": [
    {
      "id": "alert-001",
      "alertname": "HighCPUUsage",
      "severity": "warning",
      "status": "firing",
      "service": "api-gateway",
      "description": "CPU usage above 80%",
      "starts_at": "2025-12-06T10:25:00Z",
      "ends_at": null
    }
  ],
  "summary": {
    "total": 1,
    "firing": 1,
    "resolved": 0,
    "critical": 0,
    "warning": 1
  }
}
```

##### Ejemplo cURL

```bash
curl -X GET "https://monitoring.platform.local/api/v3/alerts?severity=warning" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/alerts/{alert_id}

**Método**: GET
**URL**: `/api/v3/alerts/{alert_id}`

##### Response

**200 OK**

```json
{
  "id": "alert-001",
  "alertname": "HighCPUUsage",
  "severity": "warning",
  "status": "firing",
  "service": "api-gateway",
  "description": "CPU usage above 80%",
  "labels": {
    "severity": "warning",
    "instance": "srv-001"
  },
  "starts_at": "2025-12-06T10:25:00Z",
  "ends_at": null,
  "observations": [
    {
      "timestamp": "2025-12-06T10:25:00Z",
      "value": 85.2
    }
  ]
}
```

---

### Prometheus Query

#### GET /api/v3/query

**Método**: GET
**URL**: `/api/v3/query`
**Autenticación**: Bearer Token

##### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| query | string | Sí | Query PromQL |
| time | string | No | Timestamp |

##### Response

**200 OK**

```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {
          "__name__": "http_requests_total",
          "service": "api-gateway"
        },
        "value": [1640995200, "12345"]
      }
    ]
  }
}
```

##### Ejemplo cURL

```bash
curl -X GET "https://monitoring.platform.local/api/v3/query?query=rate(http_requests_total[5m])" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Targets

#### GET /api/v3/targets

**Método**: GET
**URL**: `/api/v3/targets`
**Autenticación**: Bearer Token

##### Response

**200 OK**

```json
{
  "activeTargets": [
    {
      "instance": "srv-001:9100",
      "job": "node-exporter",
      "health": "up",
      "lastScrape": "2025-12-06T10:30:00Z",
      "labels": {
        "instance": "srv-001",
        "job": "node-exporter"
      }
    }
  ],
  "droppedTargets": []
}
```

---

### Configuración

#### GET /api/v3/config/alerts

**Método**: GET
**URL**: `/api/v3/config/alerts`
**Autenticación**: Bearer Token (Admin)

##### Response

**200 OK**

```json
{
  "rules": [
    {
      "name": "HighCPUUsage",
      "expression": "cpu_usage > 80",
      "severity": "warning",
      "duration": "5m",
      "actions": ["email", "slack"]
    }
  ]
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Dashboards Disponibles

1. **platform-overview**: Visión general de la plataforma
2. **api-gateway**: Métricas del API Gateway
3. **auth-service**: Métricas del servicio de autenticación
4. **tenant-manager**: Métricas del gestor de tenants
5. **infrastructure**: Métricas de infraestructura

---

## Soporte

- **Grafana**: https://monitoring.platform.local:3000
- **Prometheus**: https://monitoring.platform.local:9090
- **Email**: monitoring-support@platform.local

---

**Versión**: 3.0.0
**Última Actualización**: 06 de Diciembre de 2025
