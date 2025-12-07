# 🏢 Tenant Manager (PostgreSQL) - v3.0

**Componente**: Tenant Manager
**Tecnologia**: PostgreSQL + FastAPI
**Status**: 🚧 Em Desenvolvimento
**Prazo**: 12 dias
**Versão**: 1.0.0

---

## 🎯 VISÃO GERAL

O **Tenant Manager** é responsável pelo isolamento e gestão de dados multi-tenant na plataforma NEO_STACK v3.0. Implementa estratégias de isolamento por schema, alocação de recursos e governança de dados.

---

## 🏗️ ARQUITETURA

```mermaid
graph TB
    GW[API Gateway] --> TM[Tenant Manager API]
    TM --> PG[(PostgreSQL Multi-Tenant)]
    TM --> CACHE[(Redis Cache)]
    TM --> QUEUE[Message Queue]

    subgraph "Tenant Isolation"
        T1[(Schema: tenant1)]
        T2[(Schema: tenant2)]
        T3[(Schema: tenant3)]
    end

    subgraph "Shared Tables"
        SHARED[(Tenants, Users, Plans)]
    end

    TM --> T1
    TM --> T2
    TM --> T3
    TM --> SHARED
```

---

## 📦 ESTRATÉGIAS DE ISOLAMENTO

### **1. Schema per Tenant**

```sql
-- Cada tenant tem seu próprio schema
CREATE SCHEMA tenant_001;
CREATE SCHEMA tenant_002;
CREATE SCHEMA tenant_003;

-- Tabelas por tenant
CREATE TABLE tenant_001.users (...);
CREATE TABLE tenant_001.resources (...);

CREATE TABLE tenant_002.users (...);
CREATE TABLE tenant_002.resources (...);
```

**Prós**:
- Isolamento completo
- Backup/restore por tenant
- Performance otimizada
- Segurança elevada

**Contras**:
- Mais complexa gestão
- Mais storage overhead
- Migrações mais complexas

### **2. Shared Database**

```sql
-- Tabelas compartilhadas com tenant_id
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    username VARCHAR(100),
    ...
);

-- Views por tenant
CREATE VIEW tenant_001_users AS
SELECT * FROM users WHERE tenant_id = 'tenant_001';
```

**Prós**:
- Simplicidade
- Menos overhead
- Facilidade de gestão

**Contras**:
- Isolamento menor
- Performance com multi-tenancy
- Backup complexo

---

## 🛠️ IMPLEMENTAÇÃO

### **Estrutura do Projeto**

```
tenant-manager/
├── database/
│   ├── migrations/
│   ├── schemas/
│   └── seed_data/
├── api/
│   ├── endpoints/
│   ├── models/
│   ├── dependencies.py
│   └── main.py
├── services/
│   ├── tenant_service.py
│   ├── resource_service.py
│   └── isolation_service.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile
├── scripts/
│   ├── init_db.py
│   ├── migrate.py
│   └── backup.py
├── docs/
│   ├── api.md
│   └── database.md
└── README.md
```

---

## 📊 DATABASE SCHEMA

### **Tenant Table**

```sql
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    domain VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    plan_id INTEGER REFERENCES plans(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}'
);
```

### **Plan Table**

```sql
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    max_users INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 10,
    max_api_calls INTEGER DEFAULT 1000000,
    features JSONB DEFAULT '[]',
    price DECIMAL(10,2)
);
```

### **Tenant Resources Table**

```sql
CREATE TABLE tenant_resources (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id),
    resource_type VARCHAR(50),
    used INTEGER DEFAULT 0,
    limit_value INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API ENDPOINTS

### **Tenant Management**

```python
# GET /api/v1/tenants
async def list_tenants():
    """List all tenants"""
    pass

# GET /api/v1/tenants/{tenant_id}
async def get_tenant(tenant_id: str):
    """Get tenant by ID"""
    pass

# POST /api/v1/tenants
async def create_tenant(tenant_data: TenantCreate):
    """Create new tenant"""
    pass

# PATCH /api/v1/tenants/{tenant_id}
async def update_tenant(tenant_id: str, data: TenantUpdate):
    """Update tenant"""
    pass

# DELETE /api/v1/tenants/{tenant_id}
async def delete_tenant(tenant_id: str):
    """Delete tenant"""
    pass
```

### **Resource Management**

```python
# GET /api/v1/tenants/{tenant_id}/resources
async def get_resources(tenant_id: str):
    """Get tenant resource usage"""
    pass

# POST /api/v1/tenants/{tenant_id}/resources
async def update_resource(tenant_id: str, data: ResourceUpdate):
    """Update resource usage"""
    pass

# GET /api/v1/tenants/{tenant_id}/limits
async def get_limits(tenant_id: str):
    """Get tenant limits"""
    pass
```

### **Schema Management**

```python
# POST /api/v1/tenants/{tenant_id}/schema
async def create_tenant_schema(tenant_id: str):
    """Create tenant schema"""
    pass

# DELETE /api/v1/tenants/{tenant_id}/schema
async def drop_tenant_schema(tenant_id: str):
    """Drop tenant schema"""
    pass
```

---

## 🔐 SEGURANÇA

### **Row Level Security (RLS)**

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy per tenant
CREATE POLICY tenant_isolation ON users
    USING (tenant_id = current_setting('app.tenant_id'));

-- Set tenant context
SET app.tenant_id = 'tenant_001';
```

### **Connection Pooling**

```python
# PostgreSQL connection with tenant context
async def get_tenant_connection(tenant_id: str):
    conn = await asyncpg.connect(DSN)
    await conn.execute(f"SET app.tenant_id = '{tenant_id}'")
    return conn
```

### **API Security**

```python
# Middleware to extract tenant
@app.middleware("http")
async def tenant_context_middleware(request: Request, call_next):
    tenant_id = request.headers.get("X-Tenant-ID")
    if not tenant_id:
        raise HTTPException(401, "Tenant ID required")

    # Validate tenant exists
    tenant = await get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(404, "Tenant not found")

    request.state.tenant_id = tenant_id
    response = await call_next(request)
    return response
```

---

## 📊 MONITORING

### **Tenant Metrics**

```python
from prometheus_client import Counter, Histogram, Gauge

TENANT_CREATED = Counter('tenants_created_total', 'Total tenants created')
TENANT_ACTIVE = Gauge('tenants_active', 'Number of active tenants')
RESOURCE_USAGE = Gauge('tenant_resource_usage', 'Resource usage by type', ['tenant_id', 'resource_type'])
QUERY_DURATION = Histogram('tenant_query_duration_seconds', 'Query duration', ['tenant_id'])
```

### **Health Checks**

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": await check_database(),
        "tenants_count": await get_active_tenants_count(),
        "version": VERSION
    }
```

---

## 🧪 TESTES

### **Unit Tests**

```python
import pytest

@pytest.fixture
async def db():
    # Setup test database
    pass

@pytest.mark.asyncio
async def test_create_tenant(db):
    tenant = await create_tenant(
        name="Test Tenant",
        domain="test.local"
    )
    assert tenant.id is not None
    assert tenant.name == "Test Tenant"

@pytest.mark.asyncio
async def test_tenant_isolation(db):
    # Create tenants
    t1 = await create_tenant("tenant1")
    t2 = await create_tenant("tenant2")

    # Insert data
    await insert_user(t1.id, "user1")
    await insert_user(t2.id, "user2")

    # Verify isolation
    users_t1 = await get_users(t1.id)
    users_t2 = await get_users(t2.id)

    assert len(users_t1) == 1
    assert len(users_t2) == 1
    assert users_t1[0].username != users_t2[0].username
```

### **Integration Tests**

```python
@pytest.mark.asyncio
async def test_full_tenant_lifecycle():
    # Create tenant
    tenant = await api_client.post("/tenants", json={...})
    assert tenant.status_code == 201

    # Create schema
    schema = await api_client.post(f"/tenants/{tenant.id}/schema")
    assert schema.status_code == 201

    # Verify schema exists
    exists = await check_schema_exists(tenant.id)
    assert exists is True

    # Delete tenant
    delete = await api_client.delete(f"/tenants/{tenant.id}")
    assert delete.status_code == 204
```

---

## 🚀 DEPLOYMENT

### **Docker Compose**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: tenant_manager
      POSTGRES_USER: tm_user
      POSTGRES_PASSWORD: tm_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  tenant-manager:
    build: .
    environment:
      DATABASE_URL: postgresql://tm_user:tm_password@postgres:5432/tenant_manager
      REDIS_URL: redis://redis:6379/0
    ports:
      - "8081:8080"
    depends_on:
      - postgres
      - redis
```

### **Kubernetes**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tenant-manager
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tenant-manager
  template:
    metadata:
      labels:
        app: tenant-manager
    spec:
      containers:
      - name: tenant-manager
        image: neo-stack/tenant-manager:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: url
```

---

## 📈 PERFORMANCE

### **Benchmarks**

- **Query Performance**: < 50ms P95
- **Tenant Creation**: < 5 segundos
- **Schema Creation**: < 2 segundos
- **Connection Pool**: 100 connections/tenant
- **Concurrent Tenants**: 1000+ tenants

### **Optimization**

- **Connection Pooling**: PgBouncer
- **Query Caching**: Redis
- **Indexing**: Otimizado por tenant
- **Partitioning**: Por data ou tenant
- **Archiving**: Dados antigos

---

## 📚 REFERÊNCIAS

- [PostgreSQL Multi-Tenant](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [FastAPI](https://fastapi.tiangolo.com/)
- [AsyncPG](https://asyncpg.readthedocs.io/)
- [PostgREST](https://postgrest.org/)

---

## ✅ PRÓXIMOS PASSOS

1. 🚧 **Criar database schema**
2. 🚧 **Implementar FastAPI endpoints**
3. 🚧 **Configurar PostgreSQL**
4. 🚧 **Implementar RLS policies**
5. 🚧 **Criar scripts de migração**
6. 🚧 **Implementar testes**
7. 🚧 **Configurar monitoring**
8. 🚧 **Deploy em Kubernetes**

---

**Status**: 🚧 **Em Desenvolvimento - Sprint 10**
**Próximo**: Implementar Stack Deployer (Terraform)
**Prazo**: 12 dias
