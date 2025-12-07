# 🌐 API Gateway (Kong/Traefik) - v3.0

**Componente**: API Gateway
**Tecnologia**: Kong ou Traefik
**Status**: 🚧 Em Desenvolvimento
**Prazo**: 10 dias
**Versão**: 1.0.0

---

## 🎯 VISÃO GERAL

O API Gateway é o ponto de entrada único para toda a plataforma NEO_STACK v3.0. Responsável por:
- **Routing** de requisições para os microservices
- **Rate Limiting** para proteção contra abuse
- **Load Balancing** para distribuição de carga
- **Authentication/Authorization** (com Authentik)
- **API Versioning** e **Deprecation**
- **Request/Response Transformation**
- **Caching** estratégico
- **Monitoring** e **Metrics**

---

## 🏗️ ARQUITETURA

```mermaid
graph LR
    CLIENT[Client] --> LB[Load Balancer]
    LB --> GW[API Gateway Kong/Traefik]
    GW --> AUTH[Auth Service]
    GW --> TENANT[Tenant Manager]
    GW --> DEPLOY[Stack Deployer]
    GW --> MON[Monitoring]
    GW --> BILL[Billing]
    GW --> ADMIN[Admin Portal]
    GW --> TENANT_P[Tenant Portal]

    GW --> CACHE[Redis Cache]
    GW --> RATE[Rate Limiter]
    GW --> LOG[Access Logs]
```

---

## 🚀 FUNCIONALIDADES

### **Core Features**

1. **Dynamic Routing**
   - Path-based routing (`/api/v1/*`)
   - Header-based routing (`X-Tenant-ID`)
   - Host-based routing (`tenant1.platform.com`)

2. **Rate Limiting**
   - Por tenant
   - Por API endpoint
   - Por usuário
   - Burst protection

3. **Load Balancing**
   - Round-robin
   - Least connections
   - Health checks
   - Circuit breaker

4. **Security**
   - JWT validation
   - API key authentication
   - TLS termination
   - WAF integration

5. **Transformations**
   - Request headers
   - Response headers
   - Body transformation
   - GraphQL federation

---

## 📦 TECNOLOGIAS

### **Kong (Opção A)**
```yaml
Pros:
  + Plugins ricos (rate limiting, auth, caching)
  + Dashboard nativo
  + Performance excelente
  + Open source + Enterprise
  + Konga UI para management

Contras:
  - PostgreSQL obrigatório
  - Mais recursos
  - Curva de aprendizado
```

### **Traefik (Opção B)**
```yaml
Pros:
  + Configuração automática (Docker, K8s)
  + Let's Encrypt integrado
  + Lightweight
  + Dashboard web moderno
  + ACME nativo

Contras:
  - Menos plugins
  - Menos maduro para enterprise
  - Limitações em transformations
```

---

## 🎯 DECISÃO: KONG

**Escolhemos Kong** pelos seguintes motivos:

1. **Ecosystem Maduro**: Plugins extensos para enterprise
2. **Dashboard Nativo**: Konga para gestão visual
3. **Performance**: Throughput superior em high-load
4. **PostgreSQL**: Alinhado com Tenant Manager
5. **Enterprise Ready**: Suporte oficial disponível

---

## 🛠️ IMPLEMENTAÇÃO

### **Estrutura do Projeto**

```
api-gateway/
├── docker/
│   ├── docker-compose.yml
│   └── kong.yml
├── config/
│   ├── kong.conf
│   └── declarative/
│       ├── services.yml
│       ├── routes.yml
│       ├── plugins.yml
│       └── consumers.yml
├── plugins/
│   ├── rate-limiting/
│   ├── auth-jwt/
│   ├── request-transformer/
│   └── response-transformer/
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── test.sh
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── api.md
│   └── configuration.md
└── README.md
```

### **Configuração Base (kong.yml)**

```yaml
_format_version: "3.0"
_transform: true

services:
  - name: auth-service
    url: http://auth-service:8080
    routes:
      - name: auth-route
        paths:
          - /api/v1/auth
        strip_path: true
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100

  - name: tenant-service
    url: http://tenant-manager:8081
    routes:
      - name: tenant-route
        paths:
          - /api/v1/tenants
        strip_path: true
    plugins:
      - name: jwt
      - name: acl
        config:
          whitelist:
            - admin
            - tenant-admin

  - name: deploy-service
    url: http://stack-deployer:8082
    routes:
      - name: deploy-route
        paths:
          - /api/v1/deploy
        strip_path: true
    plugins:
      - name: jwt
      - name: request-size-limiting
        config:
          allowed_payload_size: 10

consumers:
  - username: admin
    jwt_secrets:
      - key: admin-key
        secret: admin-secret

  - username: tenant-user
    jwt_secrets:
      - key: tenant-key
        secret: tenant-secret

plugins:
  - name: prometheus
    config:
      per_consumer: true

  - name: http-log
    config:
      http_endpoint: http://logging-service:8080/gateway-logs
```

---

## 📊 PLUGINS CUSTOMIZADOS

### **1. Tenant Context Plugin**

```lua
-- plugins/tenant-context/handler.lua
local BasePlugin = require "kong.plugins.base_plugin"

local TenantContextHandler = BasePlugin:extend()

TenantContextHandler.PRIORITY = 1000

function TenantContextHandler:access(conf)
  TenantContextHandler.super.access(self)

  -- Extrair tenant ID do JWT ou header
  local jwt = kong.request.get_header("authorization")
  if jwt then
    local decoded = kong.jwt.decode(jwt)
    local tenant_id = decoded.tenant_id

    -- Adicionar ao contexto
    ngx.req.set_header("X-Tenant-ID", tenant_id)
    kong.ctx.shared.tenant_id = tenant_id
  end
end

return TenantContextHandler
```

### **2. Rate Limiting by Tenant**

```lua
-- plugins/tenant-rate-limiting/handler.lua
local BasePlugin = require "kong.plugins.base_plugin"

local TenantRateLimitingHandler = BasePlugin:extend()

TenantRateLimitingHandler.PRIORITY = 900

function TenantRateLimitingHandler:access(conf)
  TenantRateLimitingHandler.super.access(self)

  local tenant_id = kong.ctx.shared.tenant_id
  local key = "rate_limit:" .. tenant_id .. ":" .. ngx.var.request_uri

  -- Implementar sliding window
  local current = tonumber(ngx.shared.dict:get(key) or 0)
  local limit = conf.limit or 1000

  if current >= limit then
    return kong.response.exit(429, {
      error = "Rate limit exceeded",
      limit = limit
    })
  end

  ngx.shared.dict:incr(key, 1)
end

return TenantRateLimitingHandler
```

---

## 🔧 SETUP E DEPLOYMENT

### **Docker Compose**

```yaml
version: '3.8'

services:
  kong-database:
    image: postgres:13
    environment:
      POSTGRES_DB: kong
      POSTGRES_USER: kong
      POSTGRES_PASSWORD: kong
    volumes:
      - kong_db:/var/lib/postgresql/data
    networks:
      - kong-net

  kong-migrations:
    image: kong:latest
    command: ["kong", "migrations", "bootstrap"]
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database
    depends_on:
      - kong-database
    networks:
      - kong-net

  kong:
    image: kong:latest
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
      KONG_ADMIN_GUI_URL: http://localhost:8002
    ports:
      - "8000:8000"  # Proxy
      - "8001:8001"  # Admin API
      - "8443:8443"  # Proxy SSL
      - "8444:8444"  # Admin API SSL
    depends_on:
      - kong-database
      - kong-migrations
    networks:
      - kong-net
    volumes:
      - ./config:/usr/local/kong/declarative

  kong-dashboard:
    image: pgermann/konga
    environment:
      TOKEN_SECRET: kong_secret
      DB_ADAPTER: postgres
      DB_URI: postgres://kong:kong@kong-database:5432/kong
    ports:
      - "1337:1337"
    depends_on:
      - kong-database
    networks:
      - kong-net

volumes:
  kong_db:

networks:
  kong-net:
    driver: bridge
```

### **Kubernetes Deployment**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kong-gateway
  template:
    metadata:
      labels:
        app: kong-gateway
    spec:
      containers:
      - name: kong
        image: kong:latest
        ports:
        - containerPort: 8000
        - containerPort: 8443
        - containerPort: 8001
        env:
        - name: KONG_DATABASE
          value: "postgres"
        - name: KONG_PG_HOST
          value: "kong-postgres"
        - name: KONG_PG_DATABASE
          value: "kong"
        - name: KONG_PG_USER
          value: "kong"
        - name: KONG_PG_PASSWORD
          valueFrom:
            secretKeyRef:
              name: kong-secrets
              key: pg-password
---
apiVersion: v1
kind: Service
metadata:
  name: kong-gateway
spec:
  selector:
    app: kong-gateway
  ports:
  - name: proxy
    port: 80
    targetPort: 8000
  - name: proxy-ssl
    port: 443
    targetPort: 8443
  type: LoadBalancer
```

---

## 📊 MONITORAMENTO

### **Prometheus Metrics**

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'kong'
    static_configs:
      - targets: ['kong:8001']
    metrics_path: /metrics
```

### **Grafana Dashboard**

Métricas importantes:
- **Request Rate**: req/s por service
- **Latency**: P50, P95, P99
- **Error Rate**: 4xx, 5xx per service
- **Active Connections**: concurrent connections
- **Rate Limit**: hits/misses
- **Cache Hit Rate**: redis/hybrid cache

---

## 🧪 TESTES

### **Teste de Carga (k6)**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.get('http://kong:8000/api/v1/health');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### **Teste de Integração (pytest)**

```python
import pytest
import requests

@pytest.fixture
def kong_gateway():
    return "http://localhost:8000"

def test_auth_service_reachable(kong_gateway):
    """Testa se auth service está acessível via gateway"""
    response = requests.get(f"{kong_gateway}/api/v1/auth/health")
    assert response.status_code == 200

def test_rate_limiting(kong_gateway):
    """Testa se rate limiting está funcionando"""
    # Fazer 100 requests rapidamente
    for _ in range(100):
        response = requests.get(f"{kong_gateway}/api/v1/test")
    # O 101º deve ser rate limited
    response = requests.get(f"{kong_gateway}/api/v1/test")
    assert response.status_code == 429
```

---

## 📈 PERFORMANCE BENCHMARKS

### **Target Metrics**
- **Throughput**: 10,000 req/s
- **Latency P95**: < 50ms
- **Latency P99**: < 100ms
- **Error Rate**: < 0.1%
- **Concurrent Connections**: 50,000

### **Test Environment**
- **Instance**: AWS c5.4xlarge (16 vCPU, 32GB RAM)
- **Network**: 10 Gbps
- **Kong Version**: 3.4+

---

## 🔐 SEGURANÇA

### **TLS Configuration**

```yaml
services:
  - name: secure-service
    url: https://internal-service:8443
    plugins:
      - name: tls
        config:
          versions:
            - TLSv1.3
          cipher_suite:
            - ECDHE-RSA-AES256-GCM-SHA384
```

### **WAF Rules**

```lua
-- plugins/waf/handler.lua
local BasePlugin = require "kong.plugins.base_plugin"

local WAFHandler = BasePlugin:extend()

function WAFHandler:access(conf)
  -- SQL Injection protection
  if ngx.re.find(ngx.var.request_uri, "union.*select", "jo") then
    return kong.response.exit(403, {error = "Forbidden"})
  end

  -- XSS protection
  if ngx.re.find(ngx.var.request_uri, "<script", "jo") then
    return kong.response.exit(403, {error = "Forbidden"})
  end
end
```

---

## 📚 REFERÊNCIAS

- [Kong Documentation](https://docs.konghq.com/)
- [Kong Gateway Enterprise](https://docs.konghq.com/gateway/latest/)
- [Kong Plugins](https://docs.konghq.com/hub/)
- [Konga Dashboard](https://github.com/pantsel/konga)
- [Kong Performance](https://konghq.com/blog/kong-gateway-performance/)

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Configuração base do Kong
2. 🚧 Implementar plugins customizados
3. 🚧 Configurar monitoring (Prometheus/Grafana)
4. 🚧 Implementar testes automatizados
5. 🚧 Deploy em Kubernetes
6. 🚧 Performance testing
7. 🚧 Security audit

---

**Status**: 🚧 **Em Desenvolvimento - Sprint 9**
**Próximo**: Implementar Auth Service (Authentik)
**Prazo**: 10 dias
