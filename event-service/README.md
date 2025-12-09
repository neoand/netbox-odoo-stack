# 🚀 EVENT SERVICE
**NEO_STACK Platform v3.0 - Real-time Event System**

---

## 📋 OVERVIEW

Event Service é o sistema de eventos em tempo real do NEO_STACK Platform, baseado em **Centrifugo** e **Redis**. Fornece capacidades real-time para:

- ✅ Notificações de deployment
- ✅ Dashboards em tempo real
- ✅ Presença de usuários
- ✅ Alertas de sistema
- ✅ Sincronização multi-tenant

---

## 🏗️ ARQUITETURA

```
┌─────────────┐
│   Portals   │ (Admin, Tenant, Certification)
└──────┬──────┘
       │
       │ WebSocket
       ▼
┌─────────────────┐
│   Centrifugo    │ (WebSocket Server)
└──────┬──────────┘
       │
       │ Pub/Sub
       ▼
┌─────────────┐
│    Redis    │ (Message Broker)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Publishers     │ (Deployment, Billing, Metrics, etc.)
└─────────────────┘
```

---

## 🚀 QUICK START

### **1. Prerequisitos**

```bash
# Verificar versão do Docker
docker --version  # >= 24.0

# Verificar versão do Docker Compose
docker-compose --version  # >= 2.20
```

### **2. Clone e Setup**

```bash
# Clone o repositório
git clone https://github.com/neoand/netbox-odoo-stack.git
cd netbox-odoo-stack/event-service

# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

### **3. Configurar Variáveis**

```bash
# .env
CENTRIFUGO_TOKEN=your-secure-token-key-12345
CENTRIFUGO_SECRET=your-secure-secret-key-67890
JWT_SECRET=your-jwt-secret-key-change-in-production
REDIS_PASSWORD=your-redis-password
```

### **4. Iniciar Serviços**

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f centrifugo

# Verificar status
docker-compose ps
```

### **5. Verificar Funcionamento**

```bash
# Testar Centrifugo
curl http://localhost:8000/health

# Testar Redis
redis-cli ping

# Testar Prometheus
curl http://localhost:9090/-/healthy

# Testar Grafana
curl http://localhost:3000/api/health
```

---

## 🔧 CONFIGURATION

### **Centrifugo**

```json
// config/centrifugo.json
{
  "address": "0.0.0.0",
  "port": 8000,
  "secret": "YOUR_SECRET",
  "token": "YOUR_TOKEN",
  "engine": "redis",
  "redis_host": "redis",
  "redis_port": 6379,
  "allowed_origins": ["http://localhost:3000"],
  "history_size": 10,
  "history_ttl": 3600
}
```

### **Redis**

```conf
# config/redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## 📡 CHANNELS

### **Tenant-Specific**

```typescript
const channel = `tenant:${tenantId}:${resource}`;

// Exemplos:
tenant:123:deployments   // Deployments do tenant 123
tenant:456:billing       // Billing do tenant 456
tenant:789:metrics       // Métricas do tenant 789
```

### **Admin (Global)**

```typescript
const channel = `admin:${resource}`;

// Exemplos:
admin:metrics    // Métricas globais
admin:alerts     // Alertas globais
admin:tenants    // Atividade dos tenants
```

### **System-Wide**

```typescript
const channel = `system:${resource}`;

// Exemplos:
system:health        // Health check
system:maintenance   // Manutenção
system:announcements // Anúncios
```

---

## 💻 USAGE

### **Backend - Publish Events**

```typescript
import { deploymentPublisher } from './src/publishers/DeploymentPublisher';

// Publish deployment start
await deploymentPublisher.publishStart(
  'tenant-123',
  'odoo',
  { version: '19', modules: ['sale', 'purchase'] }
);

// Publish progress
await deploymentPublisher.publishProgress(
  'tenant-123',
  'deploy-456',
  50,
  'Configuring database...'
);

// Publish completion
await deploymentPublisher.publishCompletion(
  'tenant-123',
  'deploy-456',
  'odoo',
  'https://odoo-tenant123.neo-stack.com'
);
```

### **Frontend - Subscribe to Events**

```typescript
import { useDeploymentEvents } from '~/composables/useDeploymentEvents';

const { events, isConnected, connect } = useDeploymentEvents('tenant-123');

onMounted(() => {
  connect();
});

// Watch for events
watch(events, (newEvents) => {
  console.log('New events:', Array.from(newEvents.values()));
});
```

---

## 🧪 TESTING

### **Unit Tests**

```bash
# Executar testes unitários
npm test

# Executar com coverage
npm run test:coverage
```

### **Integration Tests**

```bash
# Executar testes de integração
npm run test:integration

# Executar testes E2E
npm run test:e2e
```

### **Manual Testing**

```bash
# Conectar ao Centrifugo via WebSocket
wscat -c ws://localhost:8000/connection/websocket

# Publicar evento (via HTTP)
curl -X POST http://localhost:8000/api/publish \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "tenant:123:deployments",
    "data": {
      "type": "deployment_start",
      "deploymentId": "test-123"
    }
  }'
```

---

## 📊 MONITORING

### **Prometheus Metrics**

Acesse: http://localhost:9090

**Métricas Principais:**
- `events_published_total` - Total de eventos publicados
- `event_publish_duration_seconds` - Latência de publicação
- `active_connections` - Conexões ativas
- `auth_failures_total` - Falhas de autenticação

### **Grafana Dashboards**

Acesse: http://localhost:3000
**Usuário:** admin
**Senha:** admin123

**Dashboards Disponíveis:**
1. **Event Flow** - Fluxo de eventos
2. **Performance** - Latência e throughput
3. **Connections** - WebSocket connections
4. **Redis** - Métricas do Redis

### **Health Checks**

```bash
# Centrifugo health
curl http://localhost:8000/health

# Event Service health
curl http://localhost:8002/health

# Redis health
redis-cli ping
```

---

## 🔒 SECURITY

### **JWT Authentication**

```typescript
// Middleware valida token JWT
const token = req.headers.authorization?.split(' ')[1];
const authContext = await authMiddleware.authenticate(token);

// Verifica autorização para canal
const authorized = await authMiddleware.authorize(
  authContext,
  'tenant:123:deployments',
  'subscribe'
);
```

### **Tenant Isolation**

```typescript
// Canal deve conter tenantId do usuário
const channel = `tenant:${context.tenantId}:deployments`;

// Middleware verifica match
if (channelTenantId !== context.tenantId) {
  throw new Error('Tenant mismatch');
}
```

### **Rate Limiting**

```typescript
// Configurado via .env
ENABLE_RATE_LIMIT=true
RATE_LIMIT_WINDOW=60      // segundos
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚨 TROUBLESHOOTING

### **WebSocket Connection Fails**

```bash
# Verificar se Centrifugo está rodando
docker-compose logs centrifugo

# Verificar configuração
curl http://localhost:8000/info

# Verificar token JWT
echo $JWT_SECRET
```

### **Messages Not Received**

```bash
# Verificar subscription
# (check browser console)

# Verificar canal
const channel = `tenant:${tenantId}:deployments`;
console.log('Subscribed to:', channel);

# Verificar logs
docker-compose logs -f event-service
```

### **High Latency**

```bash
# Verificar métricas no Grafana
# Acessar: http://localhost:3000
# Dashboard: Performance

# Verificar Redis
redis-cli info stats
redis-cli slowlog get 10
```

### **Redis Connection Issues**

```bash
# Verificar Redis
docker-compose logs redis

# Testar conexão
redis-cli -h localhost -p 6379 ping

# Verificar configuração
docker-compose exec redis cat /usr/local/etc/redis/redis.conf | grep maxmemory
```

---

## 📚 API REFERENCE

### **Publish Events**

```typescript
POST /api/events/publish
{
  "channel": "tenant:123:deployments",
  "event": {
    "type": "deployment_start",
    "data": { /* ... */ }
  }
}
```

### **Get History**

```typescript
GET /api/events/history/{channel}?limit=50
```

### **Get Metrics**

```typescript
GET /metrics  // Prometheus format
GET /api/metrics/summary
```

---

## 🛠️ DEVELOPMENT

### **Local Setup**

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Executar testes
npm test

# Build para produção
npm run build
```

### **Project Structure**

```
event-service/
├── src/
│   ├── publishers/      # Event publishers
│   ├── middleware/      # Auth & validation
│   ├── monitoring/      # Prometheus metrics
│   ├── services/        # Business logic
│   └── types/           # TypeScript types
├── config/              # Configuration files
│   ├── centrifugo.json
│   ├── prometheus.yml
│   └── grafana/
├── tests/               # Test files
└── docker-compose.yml   # Infrastructure
```

---

## 🚀 DEPLOYMENT

### **Development**

```bash
docker-compose up -d
```

### **Staging**

```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### **Production**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📖 RESOURCES

- **Centrifugo Docs**: https://centrifugal.dev/guide/
- **Redis Docs**: https://redis.io/docs/
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/

---

## 🤝 CONTRIBUITING

1. Fork o repositório
2. Crie sua branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

---

## 📄 LICENSE

MIT License - see LICENSE file for details

---

## 📞 SUPPORT

- **GitHub Issues**: https://github.com/neoand/netbox-odoo-stack/issues
- **Email**: support@neo-stack.com
- **Discord**: https://discord.gg/neo-stack

---

**Desenvolvido por**: NeoAnd with ❤️ 🚀🚀🚀
**Data**: 06 de Dezembro de 2025
**Versão**: 1.0
