# API Reference - Tenant Manager

## Visão Geral

O **Tenant Manager** é responsável pelo isolamento e gestão de dados multi-tenant na plataforma NEO_STACK v3.0. Implementa estratégias de isolamento por schema, alocação de recursos e governança de dados usando PostgreSQL + FastAPI.

### Informações Base

- **Versão da API**: v3.0
- **Base URL**: `https://tenant-manager.platform.local/api/v3`
- **Protocolo**: HTTPS obrigatório
- **Formato**: JSON
- **Database**: PostgreSQL com Row Level Security (RLS)

---

## Autenticação

### JWT Bearer Token

```http
Authorization: Bearer <jwt_token>
```

### Headers Obrigatórios

```http
X-Tenant-ID: <tenant_id>
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
  "database": "connected",
  "version": "3.0.0"
}
```

---

### Gerenciamento de Tenants

#### GET /api/v3/tenants

**Método**: GET
**URL**: `/api/v3/tenants`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| limit | integer | Não | Máximo de resultados (padrão: 50) |
| offset | integer | Não | Offset para paginação (padrão: 0) |
| status | string | Não | Filtrar por status |

##### Response

**200 OK**

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
      "settings": {}
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

##### Exemplo cURL

```bash
curl -X GET "https://tenant-manager.platform.local/api/v3/tenants?limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/tenants/{tenant_id}

**Método**: GET
**URL**: `/api/v3/tenants/{tenant_id}`

##### Response

**200 OK**

```json
{
  "id": "tenant1",
  "name": "Tenant 1",
  "domain": "tenant1.platform.local",
  "status": "active",
  "plan_id": 1,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-12-06T10:00:00Z",
  "settings": {},
  "limits": {
    "max_users": 100,
    "max_storage_gb": 10,
    "max_api_calls": 1000000
  }
}
```

---

#### POST /api/v3/tenants

**Método**: POST
**URL**: `/api/v3/tenants`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

```json
{
  "id": "tenant2",
  "name": "Tenant 2",
  "domain": "tenant2.platform.local",
  "plan_id": 2,
  "settings": {}
}
```

##### Response

**201 Created**

```json
{
  "id": "tenant2",
  "name": "Tenant 2",
  "status": "active",
  "created_at": "2025-12-06T10:30:00Z"
}
```

---

#### PATCH /api/v3/tenants/{tenant_id}

**Método**: PATCH

##### Response

**200 OK**

```json
{
  "id": "tenant1",
  "updated_at": "2025-12-06T10:35:00Z"
}
```

---

#### DELETE /api/v3/tenants/{tenant_id}

**Método**: DELETE

##### Response

**204 No Content**

---

### Recursos por Tenant

#### GET /api/v3/tenants/{tenant_id}/resources

**Método**: GET

##### Response

**200 OK**

```json
{
  "tenant_id": "tenant1",
  "resources": [
    {
      "resource_type": "users",
      "used": 45,
      "limit_value": 100,
      "percentage": 45
    }
  ],
  "last_updated": "2025-12-06T10:30:00Z"
}
```

---

#### POST /api/v3/tenants/{tenant_id}/resources

**Método**: POST

##### Parâmetros

```json
{
  "resource_type": "users",
  "used": 50
}
```

##### Response

**200 OK**

```json
{
  "resource_type": "users",
  "used": 50,
  "updated_at": "2025-12-06T10:30:00Z"
}
```

---

### Schema Management

#### POST /api/v3/tenants/{tenant_id}/schema

**Método**: POST
**Autenticação**: Bearer Token (Admin)

##### Response

**201 Created**

```json
{
  "tenant_id": "tenant1",
  "schema_name": "tenant_001",
  "status": "created"
}
```

---

#### DELETE /api/v3/tenants/{tenant_id}/schema

**Método**: DELETE

##### Response

**204 No Content**

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

**Versão**: 3.0.0
**Última Atualização**: 06 de Dezembro de 2025
