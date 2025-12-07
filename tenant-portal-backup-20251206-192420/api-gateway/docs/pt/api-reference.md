# API Reference - API Gateway

## Visão Geral

O **API Gateway** é o ponto de entrada central para toda a plataforma NEO_STACK v3.0. Utilizando **Kong Gateway**, oferece roteamento dinâmico, limitação de taxa, balanceamento de carga, autenticação/autorização, versionamento de API, transformação de requisições/respostas, caching estratégico e monitoramento em tempo real.

### Informações Base

- **Versão da API**: v3.0
- **Base URL**: `https://api.platform.local/api/v3`
- **Protocolo**: HTTPS obrigatório
- **Formato**: JSON
- **Gateway**: Kong Gateway 3.4+

---

## Autenticação

O API Gateway suporta múltiplos métodos de autenticação:

### 1. JWT (JSON Web Token)

```http
Authorization: Bearer <jwt_token>
```

### 2. API Key

```http
X-API-Key: <api_key>
```

### 3. Tenant Context

```http
X-Tenant-ID: <tenant_id>
```

### 4. Rate Limiting

- Por tenant: 1000 req/minuto
- Por usuário: 100 req/minuto
- Por endpoint: específico por rota

---

## Endpoints

### Health Check

Verifica o status do gateway e serviços conectados.

#### GET /api/v3/health

**Método**: GET
**URL**: `/api/v3/health`
**Autenticação**: Opcional

##### Parâmetros

Nenhum.

##### Response

**200 OK** - Gateway saudável

```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T10:30:00Z",
  "version": "3.0.0",
  "services": {
    "auth-service": "healthy",
    "tenant-manager": "healthy",
    "analytics": "healthy"
  },
  "uptime": 86400
}
```

##### Exemplo cURL

```bash
curl -X GET https://api.platform.local/api/v3/health \
  -H "Content-Type: application/json"
```

---

### Proxy - Auth Service

Roteia requisições para o serviço de autenticação (Authentik).

#### GET /api/v3/auth/login/

**Método**: POST
**URL**: `/api/v3/auth/login/`
**Autenticação**: Não requerida

##### Parâmetros

**Body** (application/json):

```json
{
  "username": "string",
  "password": "string",
  "tenant_id": "string"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| username | string | Sim | Nome do usuário |
| password | string | Sim | Senha do usuário |
| tenant_id | string | Sim | ID do tenant |

##### Response

**200 OK** - Login realizado com sucesso

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "username": "admin",
    "email": "admin@example.com",
    "tenant_id": "tenant1",
    "groups": ["admin", "tenant-admin"]
  },
  "tenant_id": "tenant1",
  "expires_at": "2025-12-06T11:30:00Z"
}
```

**401 Unauthorized** - Credenciais inválidas

```json
{
  "error": "invalid_credentials",
  "message": "Nome de usuário ou senha inválidos"
}
```

##### Exemplo cURL

```bash
curl -X POST https://api.platform.local/api/v3/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure_password",
    "tenant_id": "tenant1"
  }'
```

---

#### POST /api/v3/auth/refresh/

**Método**: POST
**URL**: `/api/v3/auth/refresh/`
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum (token no header).

##### Response

**200 OK** - Token renovado

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-12-06T11:30:00Z"
}
```

**401 Unauthorized** - Token inválido ou expirado

```json
{
  "error": "invalid_token",
  "message": "Token inválido ou expirado"
}
```

##### Exemplo cURL

```bash
curl -X POST https://api.platform.local/api/v3/auth/refresh/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### POST /api/v3/auth/logout/

**Método**: POST
**URL**: `/api/v3/auth/logout/`
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum.

##### Response

**204 No Content** - Logout realizado com sucesso

##### Exemplo cURL

```bash
curl -X POST https://api.platform.local/api/v3/auth/logout/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/auth/users/me/

**Método**: GET
**URL**: `/api/v3/auth/users/me/`
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum.

##### Response

**200 OK** - Dados do usuário atual

```json
{
  "id": "user-123",
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Administrador",
  "last_name": "Sistema",
  "tenant_id": "tenant1",
  "groups": ["admin", "tenant-admin"],
  "attributes": {
    "role": "admin",
    "department": "TI"
  },
  "is_active": true,
  "last_login": "2025-12-06T09:00:00Z"
}
```

**401 Unauthorized** - Token inválido

##### Exemplo cURL

```bash
curl -X GET https://api.platform.local/api/v3/auth/users/me/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Proxy - Tenant Manager

Roteia requisições para o gerenciador de tenants.

#### GET /api/v3/tenants

**Método**: GET
**URL**: `/api/v3/tenants`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| limit | integer | Não | Número máximo de resultados (padrão: 50) |
| offset | integer | Não | Offset para paginação (padrão: 0) |
| status | string | Não | Filtrar por status (active, inactive, suspended) |

##### Response

**200 OK** - Lista de tenants

```json
{
  "items": [
    {
      "id": "tenant1",
      "name": "Tenant 1",
      "domain": "tenant1.platform.local",
      "status": "active",
      "plan_id": 1,
      "created_at": "2025-01-01T00:00:00Z",
      "settings": {
        "branding": {
          "logo": "/media/tenant1/logo.png",
          "primary_color": "#1f77b4"
        }
      }
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**403 Forbidden** - Acesso negado (não é admin)

##### Exemplo cURL

```bash
curl -X GET "https://api.platform.local/api/v3/tenants?limit=10&status=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### GET /api/v3/tenants/{tenant_id}

**Método**: GET
**URL**: `/api/v3/tenants/{tenant_id}`
**Autenticação**: Bearer Token

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| tenant_id | string | Sim | ID do tenant |

##### Response

**200 OK** - Detalhes do tenant

```json
{
  "id": "tenant1",
  "name": "Tenant 1",
  "domain": "tenant1.platform.local",
  "status": "active",
  "plan_id": 1,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-12-06T10:00:00Z",
  "settings": {
    "branding": {
      "logo": "/media/tenant1/logo.png",
      "primary_color": "#1f77b4"
    },
    "features": {
      "mfa_enabled": true,
      "sso_enabled": true
    }
  },
  "limits": {
    "max_users": 100,
    "max_storage_gb": 10,
    "max_api_calls": 1000000
  }
}
```

**404 Not Found** - Tenant não encontrado

##### Exemplo cURL

```bash
curl -X GET https://api.platform.local/api/v3/tenants/tenant1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### POST /api/v3/tenants

**Método**: POST
**URL**: `/api/v3/tenants`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Body** (application/json):

```json
{
  "id": "tenant2",
  "name": "Tenant 2",
  "domain": "tenant2.platform.local",
  "plan_id": 2,
  "settings": {
    "branding": {
      "logo": "/media/tenant2/logo.png",
      "primary_color": "#ff7f0e"
    }
  }
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | string | Sim | ID único do tenant |
| name | string | Sim | Nome do tenant |
| domain | string | Sim | Domínio do tenant |
| plan_id | integer | Sim | ID do plano |
| settings | object | Não | Configurações customizadas |

##### Response

**201 Created** - Tenant criado com sucesso

```json
{
  "id": "tenant2",
  "name": "Tenant 2",
  "status": "active",
  "created_at": "2025-12-06T10:30:00Z",
  "message": "Tenant criado com sucesso"
}
```

**400 Bad Request** - Dados inválidos

##### Exemplo cURL

```bash
curl -X POST https://api.platform.local/api/v3/tenants \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "id": "tenant2",
    "name": "Tenant 2",
    "domain": "tenant2.platform.local",
    "plan_id": 2
  }'
```

---

#### PATCH /api/v3/tenants/{tenant_id}

**Método**: PATCH
**URL**: `/api/v3/tenants/{tenant_id}`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| tenant_id | string | Sim | ID do tenant |

**Body** (application/json) - Campos a serem atualizados:

```json
{
  "name": "Tenant 1 Atualizado",
  "status": "active",
  "settings": {
    "branding": {
      "primary_color": "#2ca02c"
    }
  }
}
```

##### Response

**200 OK** - Tenant atualizado

```json
{
  "id": "tenant1",
  "name": "Tenant 1 Atualizado",
  "status": "active",
  "updated_at": "2025-12-06T10:35:00Z",
  "message": "Tenant atualizado com sucesso"
}
```

##### Exemplo cURL

```bash
curl -X PATCH https://api.platform.local/api/v3/tenants/tenant1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tenant 1 Atualizado"
  }'
```

---

#### DELETE /api/v3/tenants/{tenant_id}

**Método**: DELETE
**URL**: `/api/v3/tenants/{tenant_id}`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| tenant_id | string | Sim | ID do tenant |

##### Response

**204 No Content** - Tenant excluído com sucesso

##### Exemplo cURL

```bash
curl -X DELETE https://api.platform.local/api/v3/tenants/tenant2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/tenants/{tenant_id}/resources

**Método**: GET
**URL**: `/api/v3/tenants/{tenant_id}/resources`
**Autenticação**: Bearer Token

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| tenant_id | string | Sim | ID do tenant |

##### Response

**200 OK** - Recursos do tenant

```json
{
  "tenant_id": "tenant1",
  "resources": [
    {
      "resource_type": "users",
      "used": 45,
      "limit_value": 100,
      "percentage": 45
    },
    {
      "resource_type": "storage_gb",
      "used": 5.2,
      "limit_value": 10,
      "percentage": 52
    },
    {
      "resource_type": "api_calls",
      "used": 250000,
      "limit_value": 1000000,
      "percentage": 25
    }
  ],
  "last_updated": "2025-12-06T10:30:00Z"
}
```

##### Exemplo cURL

```bash
curl -X GET https://api.platform.local/api/v3/tenants/tenant1/resources \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### POST /api/v3/tenants/{tenant_id}/schema

**Método**: POST
**URL**: `/api/v3/tenants/{tenant_id}/schema`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| tenant_id | string | Sim | ID do tenant |

##### Response

**201 Created** - Schema criado

```json
{
  "tenant_id": "tenant1",
  "schema_name": "tenant_001",
  "status": "created",
  "message": "Schema criado com sucesso"
}
```

##### Exemplo cURL

```bash
curl -X POST https://api.platform.local/api/v3/tenants/tenant1/schema \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Proxy - Analytics

Roteia requisições para a plataforma de analytics.

#### GET /api/v3/analytics/dashboards/executive

**Método**: GET
**URL**: `/api/v3/analytics/dashboards/executive`
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum.

##### Response

**200 OK** - Dashboard executivo

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
      "message": "Uso de CPU acima de 80% em srv-001",
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

##### Exemplo cURL

```bash
curl -X GET https://api.platform.local/api/v3/analytics/dashboards/executive \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### POST /api/v3/analytics/anomaly-detection

**Método**: POST
**URL**: `/api/v3/analytics/anomaly-detection`
**Autenticação**: Bearer Token

##### Parâmetros

**Body** (application/json):

```json
{
  "device_id": "srv-001",
  "metrics": {
    "cpu": 85.5,
    "memory": 72.3,
    "disk": 45.2,
    "network_in": 1024,
    "network_out": 2048,
    "temperature": 68.5
  },
  "timestamp": "2025-12-06T10:30:00Z"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| device_id | string | Sim | ID do dispositivo |
| metrics | object | Sim | Métricas do dispositivo |
| timestamp | string | Não | Timestamp (padrão: agora) |

##### Response

**200 OK** - Resultado da detecção

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

##### Exemplo cURL

```bash
curl -X POST https://api.platform.local/api/v3/analytics/anomaly-detection \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "srv-001",
    "metrics": {
      "cpu": 85.5,
      "memory": 72.3,
      "disk": 45.2
    }
  }'
```

---

#### GET /api/v3/analytics/capacity-forecast/{device_id}

**Método**: GET
**URL**: `/api/v3/analytics/capacity-forecast/{device_id}`
**Autenticação**: Bearer Token

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| device_id | string | Sim | ID do dispositivo |

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| days | integer | Não | Dias de previsão (padrão: 30, máximo: 90) |

##### Response

**200 OK** - Previsão de capacidade

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

##### Exemplo cURL

```bash
curl -X GET "https://api.platform.local/api/v3/analytics/capacity-forecast/srv-001?days=30" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/analytics/incident-prediction

**Método**: GET
**URL**: `/api/v3/analytics/incident-prediction`
**Autenticação**: Bearer Token

##### Parâmetros

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| days | integer | Não | Dias de previsão (padrão: 7, máximo: 30) |

##### Response

**200 OK** - Previsão de incidentes

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

##### Exemplo cURL

```bash
curl -X GET "https://api.platform.local/api/v3/analytics/incident-prediction?days=7" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/analytics/timeseries

**Método**: GET
**URL**: `/api/v3/analytics/timeseries`
**Autenticação**: Bearer Token

##### Parâmetros

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| device_id | string | Sim | ID do dispositivo |
| metric | string | Sim | Nome da métrica (cpu, memory, disk, network) |
| start | string | Sim | Data inicial (ISO 8601) |
| end | string | Sim | Data final (ISO 8601) |
| interval | string | Não | Intervalo (1m, 5m, 1h, 1d, padrão: 1h) |

##### Response

**200 OK** - Dados de série temporal

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

##### Exemplo cURL

```bash
curl -X GET "https://api.platform.local/api/v3/analytics/timeseries?device_id=srv-001&metric=cpu&start=2025-12-01T00:00:00Z&end=2025-12-06T00:00:00Z&interval=1h" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Proxy - Monitoring

Roteia requisições para o serviço de monitoramento.

#### GET /api/v3/monitoring/metrics

**Método**: GET
**URL**: `/api/v3/monitoring/metrics`
**Autenticação**: Bearer Token

##### Parâmetros

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| service | string | Não | Filtrar por serviço (api-gateway, auth-service, etc.) |
| metric | string | Não | Filtrar por métrica específica |
| start | string | Não | Data inicial (ISO 8601, padrão: 1h atrás) |
| end | string | Não | Data final (ISO 8601, padrão: agora) |

##### Response

**200 OK** - Métricas do monitoramento

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
        "status": "200",
        "endpoint": "/api/v3/health"
      }
    },
    {
      "service": "api-gateway",
      "metric": "http_request_duration_seconds",
      "value": 0.045,
      "labels": {
        "method": "GET",
        "status": "200",
        "endpoint": "/api/v3/health"
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

##### Exemplo cURL

```bash
curl -X GET "https://api.platform.local/api/v3/monitoring/metrics?service=api-gateway" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/monitoring/dashboards/{dashboard_name}

**Método**: GET
**URL**: `/api/v3/monitoring/dashboards/{dashboard_name}`
**Autenticação**: Bearer Token

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| dashboard_name | string | Sim | Nome do dashboard (platform-overview, api-gateway, etc.) |

##### Response

**200 OK** - Dados do dashboard

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
        },
        {
          "timestamp": "2025-12-06T10:00:00Z",
          "value": 1320
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "stat",
      "value": 0.5,
      "unit": "%",
      "status": "warning"
    }
  ]
}
```

##### Exemplo cURL

```bash
curl -X GET https://api.platform.local/api/v3/monitoring/dashboards/platform-overview \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/monitoring/alerts

**Método**: GET
**URL**: `/api/v3/monitoring/alerts`
**Autenticação**: Bearer Token

##### Parâmetros

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| severity | string | Não | Filtrar por severidade (critical, warning, info) |
| status | string | Não | Filtrar por status (firing, resolved, pending) |
| service | string | Não | Filtrar por serviço |

##### Response

**200 OK** - Lista de alertas

```json
{
  "alerts": [
    {
      "id": "alert-001",
      "alertname": "HighCPUUsage",
      "severity": "warning",
      "status": "firing",
      "service": "api-gateway",
      "instance": "srv-001",
      "description": "CPU usage above 80%",
      "summary": "High CPU usage detected on srv-001",
      "labels": {
        "severity": "warning",
        "instance": "srv-001",
        "threshold": "80"
      },
      "annotations": {
        "runbook_url": "https://docs.platform.local/runbooks/high-cpu"
      },
      "starts_at": "2025-12-06T10:25:00Z",
      "ends_at": null
    }
  ],
  "summary": {
    "total": 1,
    "firing": 1,
    "resolved": 0,
    "critical": 0,
    "warning": 1,
    "info": 0
  }
}
```

##### Exemplo cURL

```bash
curl -X GET "https://api.platform.local/api/v3/monitoring/alerts?severity=warning" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/monitoring/alerts/{alert_id}

**Método**: GET
**URL**: `/api/v3/monitoring/alerts/{alert_id}`
**Autenticação**: Bearer Token

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| alert_id | string | Sim | ID do alerta |

##### Response

**200 OK** - Detalhes do alerta

```json
{
  "id": "alert-001",
  "alertname": "HighCPUUsage",
  "severity": "warning",
  "status": "firing",
  "service": "api-gateway",
  "instance": "srv-001",
  "description": "CPU usage above 80%",
  "summary": "High CPU usage detected on srv-001",
  "labels": {
    "severity": "warning",
    "instance": "srv-001",
    "threshold": "80"
  },
  "annotations": {
    "runbook_url": "https://docs.platform.local/runbooks/high-cpu",
    "message": "CPU usage is 85%, above the 80% threshold"
  },
  "starts_at": "2025-12-06T10:25:00Z",
  "ends_at": null,
  "observations": [
    {
      "timestamp": "2025-12-06T10:25:00Z",
      "value": 85.2
    },
    {
      "timestamp": "2025-12-06T10:26:00Z",
      "value": 86.1
    }
  ]
}
```

##### Exemplo cURL

```bash
curl -X GET https://api.platform.local/api/v3/monitoring/alerts/alert-001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Códigos de Erro

### Códigos HTTP Comuns

| Código | Descrição | Significado |
|--------|-----------|-------------|
| **200** | OK | Requisição processada com sucesso |
| **201** | Created | Recurso criado com sucesso |
| **204** | No Content | Operação realizada com sucesso, sem conteúdo |
| **400** | Bad Request | Parâmetros inválidos ou malformados |
| **401** | Unauthorized | Autenticação necessária ou inválida |
| **403** | Forbidden | Acesso negado, sem permissão |
| **404** | Not Found | Recurso não encontrado |
| **409** | Conflict | Conflito (ex: tenant já existe) |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Erro interno do servidor |
| **502** | Bad Gateway | Erro ao comunicar com serviço downstream |
| **503** | Service Unavailable | Serviço temporariamente indisponível |

### Erros Específicos da API

| Código | Erro | Descrição |
|--------|------|-----------|
| **1001** | invalid_credentials | Nome de usuário ou senha inválidos |
| **1002** | token_expired | Token JWT expirado |
| **1003** | token_invalid | Token JWT inválido |
| **1004** | tenant_not_found | Tenant não encontrado |
| **1005** | tenant_suspended | Tenant suspenso |
| **1006** | quota_exceeded | Limite de recursos excedido |
| **1007** | rate_limit_exceeded | Rate limit excedido para o tenant |
| **1008** | insufficient_permissions | Permissões insuficientes |
| **1009** | service_unavailable | Serviço downstream indisponível |
| **1010** | validation_error | Erro de validação dos dados |

### Estrutura de Erro

```json
{
  "error": {
    "code": 1001,
    "type": "invalid_credentials",
    "message": "Nome de usuário ou senha inválidos",
    "details": {
      "field": "password",
      "reason": "Senha incorreta"
    },
    "timestamp": "2025-12-06T10:30:00Z",
    "request_id": "req-12345"
  }
}
```

---

## Versionamento

A API utiliza versionamento por URL. Versões suportadas:

- **v3.0** (atual) - `https://api.platform.local/api/v3`
- v2.0 (legado) - `https://api.platform.local/api/v2`
- v1.0 (legado) - `https://api.platform.local/api/v1`

### Depreciação

Versões antigas serão mantidas por pelo menos 12 meses após o lançamento de uma nova versão. Notificações de depreciação serão enviadas com 90 dias de antecedência.

---

## Rate Limiting

### Limites por Tier

| Tier | Requests/minuto | Requests/dia |
|------|-----------------|--------------|
| **Free** | 100 | 10,000 |
| **Basic** | 1,000 | 100,000 |
| **Professional** | 5,000 | 500,000 |
| **Enterprise** | 10,000 | 1,000,000 |

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Tratando Rate Limiting

**429 Too Many Requests**:

```json
{
  "error": {
    "code": 1007,
    "type": "rate_limit_exceeded",
    "message": "Rate limit excedido. Tente novamente em 60 segundos",
    "retry_after": 60
  }
}
```

---

## Suporte

- **Documentação**: https://docs.platform.local/api
- **Status Page**: https://status.platform.local
- **Email**: api-support@platform.local
- **Slack**: #api-support

---

**Versão**: 3.0.0
**Última Atualização**: 06 de Dezembro de 2025
