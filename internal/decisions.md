# 🏛️ ARCHITECTURE DECISION RECORDS
**NEO_STACK Platform v3.0 - Centrifugo Integration**

---

## 📋 RESUMO

Este documento registra as principais decisões arquiteturais relacionadas à integração do Centrifugo no NEO_STACK Platform v3.0. Cada ADR segue o formato recomendado por Michael Nygard.

---

## ADR-001: Escolha do Centrifugo como Event Server

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

O NEO_STACK Platform v3.0 precisa de capacidades real-time para:
- Notificações de deployment
- Dashboards em tempo real
- Presença de usuários
- Alertas de sistema
- Sincronização multi-tenant

### **Alternativas Consideradas**

1. **Socket.io**
   - ✅ WebSockets + fallback
   - ❌ Menos eficiente para pub/sub
   - ❌ Overhead de rooms
   - **Rejeitado**: Performance insuficiente

2. **Pusher**
   - ✅ SaaS gerenciado
   - ❌ Lock-in do fornecedor
   - ❌ Custo por mensagem
   - **Rejeitado**: Dependência externa

3. **Ably**
   - ✅ Alta performance
   - ❌ Muito caro ($2,500+/mês)
   - ❌ Vendor lock-in
   - **Rejeitado**: Custo proibitivo

4. **Centrifugo**
   - ✅ Open source
   - ✅ Redis nativo
   - ✅ Horizontal scaling
   - ✅ Auto-hospedado
   - **Aceito**: Melhor custo-benefício

### **Decisão**

Usar **Centrifugo v3** como servidor de eventos real-time.

### **Justificativa**

1. **Performance**: Benchmarks mostram 50k+ msgs/s com Redis backend
2. **Custo**: Zero licensing fees, apenas infraestrutura
3. **Controle**: Totalmente customizável e auto-hospedado
4. **Escalabilidade**: Suporte nativo a horizontal scaling
5. **Comunidade**: Ativamente mantido, boa documentação

### **Consequências**

**Positivas:**
- ✅ Redução de custos operacionais
- ✅ Controle total sobre dados e configurações
- ✅ Escalabilidade linear com recursos
- ✅ Integração nativa com Redis

**Negativas:**
- ❌ Responsabilidade de manutenção
- ❌ Necessidade de expertise interna
- ❌ Tempo de setup inicial
- ❌ Monitoramento próprio

---

## ADR-002: Padrão Multi-tenant por Canal

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Como isolar eventos entre tenants em uma plataforma SaaS multi-tenant?

### **Alternativas Consideradas**

1. **Namespace por Tenant**
   ```
   namespace: tenant-{id}
   channel: {resource}
   ```
   - ✅ Isolamento claro
   - ❌ Configuração complexa
   - ❌ Limite de namespaces
   - **Rejeitado**: Limitações de escala

2. **Prefix por Tenant**
   ```
   channel: {tenantId}.{resource}
   ```
   - ✅ Simples de implementar
   - ❌ Risco de collision
   - ❌ Parsing necessário
   - **Rejeitado**: Risco de segurança

3. **Canal com TenantId**
   ```
   channel: tenant:{tenantId}:{resource}
   ```
   - ✅ Isolamento natural
   - ✅ Parsing simples
   - ✅ Escalabilidade infinita
   - **Aceito**: Melhor abordagem

### **Decisão**

Usar padrão `tenant:{tenantId}:{resource}` para canais específicos do tenant.

### **Justificativa**

1. **Segurança**: Isolamento garantido por canal
2. **Simplicidade**: Parsing direto com split(':')
3. **Escalabilidade**: Sem limite teórico de tenants
4. **Debugging**: Fácil identificar origem dos eventos
5. **Flexibilidade**: Suporte a canais admin e sistema

### **Exemplos de Canais**

```typescript
// Tenant-specific
tenant:123:deployments
tenant:123:billing
tenant:123:metrics
tenant:123:presence

// Admin (global)
admin:metrics
admin:alerts
admin:tenants

// System-wide
system:health
system:maintenance
```

### **Consequências**

**Positivas:**
- ✅ Isolamento garantido
- ✅ Fácil implementação
- ✅ Suporte a escopos (tenant, admin, system)
- ✅ Logging e debugging simplificado

**Negativas:**
- ❌ Necessidade de parsing em cada evento
- ❌ Validação de tenantId em middleware
- ❌ Canais mais longos

---

## ADR-003: Publisher/Subscriber Pattern

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Como desacoplar producers de consumers de eventos?

### **Alternativas Consideradas**

1. **Direct Publishing**
   ```typescript
   await centrifugo.publish(channel, event);
   ```
   - ✅ Simples
   - ❌ Alto acoplamento
   - ❌ Difícil testar
   - **Rejeitado**: Acoplamento

2. **Event Bus Centralizado**
   ```typescript
   eventBus.emit('deployment:start', event);
   ```
   - ✅ Desacoplado
   - ❌ Single point of failure
   - ❌ Complexidade alta
   - **Rejeitado**: Complexidade

3. **Publisher Classes**
   ```typescript
   class DeploymentPublisher {
     async publishStart(...) { ... }
     async publishProgress(...) { ... }
   }
   ```
   - ✅ Desacoplado
   - ✅ Testável
   - ✅ Reutilizável
   - **Aceito**: Melhor prática

### **Decisão**

Implementar **Publisher Classes** para cada tipo de evento.

### **Justificativa**

1. **Desacoplamento**: Producers não conhecem consumers
2. **Testabilidade**: Fácil mockar publishers em testes
3. **Reutilização**: Publishers podem ser usados em múltiplos contextos
4. **Manutenibilidade**: Mudanças em um publisher não afetam outros
5. **Type Safety**: TypeScript interfaces garantem consistência

### **Estrutura dos Publishers**

```typescript
export interface DeploymentEvent {
  tenantId: string;
  deploymentId: string;
  instanceType: string;
  status: string;
  progress: number;
  // ...
}

export class DeploymentPublisher extends EventEmitter {
  async publishStart(tenantId: string, deploymentId: string, instanceType: string) {
    const event: DeploymentEvent = { /* ... */ };
    await this.centrifugo.publish(channel, event);
    this.emit('published', event);
  }
}
```

### **Consequências**

**Positivas:**
- ✅ Loose coupling
- ✅ High testability
- ✅ Easy to extend
- ✅ Clear responsibility boundaries

**Negativas:**
- ❌ Mais classes para manter
- ❌ Indireção adicional
- ❌ Necessidade de interface common

---

## ADR-004: Frontend Composables Pattern

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Como integrar eventos real-time no frontend Nuxt 3?

### **Alternativas Consideradas**

1. **Pinia Stores**
   ```typescript
   // stores/deployment.ts
   export const useDeploymentStore = defineStore('deployment', () => {
     // ...
   })
   ```
   - ✅ Estado global
   - ❌ Overhead desnecessário
   - ❌ Verbose para eventos
   - **Rejeitado**: Overkill

2. **Direct WebSocket**
   ```typescript
   const ws = new WebSocket(url);
   ws.onmessage = (msg) => { /* ... */ };
   ```
   - ✅ Simples
   - ❌ Repetitivo
   - ❌ Difícil reutilizar
   - **Rejeitado**: Duplicação

3. **Composables**
   ```typescript
   export const useDeploymentEvents = (tenantId: string) => {
     const events = ref([]);
     const connect = () => { /* ... */ };
     return { events, connect };
   }
   ```
   - ✅ Reutilizável
   - ✅ Type-safe
   - ✅ Lifecycle management
   - **Aceito**: Padrão Nuxt 3

### **Decisão**

Usar **Nuxt 3 Composables** para integração real-time.

### **Justificativa**

1. **Padrão Vue/Nuxt**: Composables são padrão oficial
2. **Reutilização**: Lógica reutilizável entre componentes
3. **TypeScript**: Full type safety
4. **Lifecycle**: Gerenciamento automático de cleanup
5. **Simplicidade**: API simples e intuitiva

### **Estrutura dos Composables**

```typescript
export const useDeploymentEvents = (tenantId: string) => {
  // State
  const events = ref<Map<string, DeploymentEvent>>(new Map());
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  // Connection
  const connect = () => { /* WebSocket logic */ };
  const disconnect = () => { /* Cleanup */ };

  // Auto-reconnect
  onUnmounted(() => disconnect());

  return {
    events,
    isConnected,
    error,
    connect,
    disconnect,
    getDeploymentEvents,
    getAllDeployments
  };
};
```

### **Consequências**

**Positivas:**
- ✅ Consistent with Nuxt 3 patterns
- ✅ Easy to use in components
- ✅ Full TypeScript support
- ✅ Automatic lifecycle management

**Negativas:**
- ❌ Learning curve for newcomers
- ❌ Multiple composables to maintain
- ❌ Need to import in each component

---

## ADR-005: JWT Middleware com Tenant Isolation

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Como garantir segurança e isolamento multi-tenant em canais WebSocket?

### **Alternativas Consideradas**

1. **Sem Autenticação**
   - ❌ Qualquer um pode se conectar
   - ❌ Sem isolamento
   - **Rejeitado**: Inaceitável para SaaS

2. **API Key por Tenant**
   - ✅ Simples
   - ❌ Difícil de revogar
   - ❌ Sem granularidade
   - **Rejeitado**: Pouco seguro

3. **JWT com TenantId**
   - ✅ Stateless
   - ✅ Fácil validar
   - ✅ Suporte a roles
   - ✅ Expiração natural
   - **Aceito**: Melhor prática

### **Decisão**

Implementar **JWT Middleware** com validação de tenantId.

### **Justificativa**

1. **Stateless**: Não precisa de sessão no servidor
2. **Performance**: Validação é O(1)
3. **Escalabilidade**: Funciona em multi-região
4. **Segurança**: Assinatura criptográfica
5. **Flexibilidade**: Suporte a roles e permissions

### **Estrutura do JWT**

```json
{
  "sub": "user-123",
  "tenantId": "tenant-456",
  "roles": ["user", "developer"],
  "permissions": ["deploy:read", "metrics:read"],
  "iat": 1701234567,
  "exp": 1701320000
}
```

### **Middleware Logic**

```typescript
async authorize(context: AuthContext, channel: string): Promise<boolean> {
  // 1. Check tenant isolation
  if (channel.includes('tenant:')) {
    const channelTenantId = channel.split(':')[1];
    if (channelTenantId !== context.tenantId) {
      return false; // Tenant mismatch!
    }
  }

  // 2. Check admin access
  if (channel.startsWith('admin:')) {
    if (!context.roles.includes('admin')) {
      return false; // Not admin!
    }
  }

  // 3. Check permissions
  const requiredPermission = this.getRequiredPermission(channel);
  if (requiredPermission && !context.permissions.includes(requiredPermission)) {
    return false; // No permission!
  }

  return true;
}
```

### **Consequências**

**Positivas:**
- ✅ Strong security guarantees
- ✅ Tenant isolation enforced
- ✅ Support for RBAC
- ✅ Stateless validation
- ✅ Easy to implement

**Negativas:**
- ❌ Token management overhead
- ❌ Need to handle token refresh
- ❌ Complexity in middleware

---

## ADR-006: Redis para Persistência e Cache

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Qual backend usar para Centrifugo? Redis vs PostgreSQL vs Memcached?

### **Alternativas Consideradas**

1. **PostgreSQL**
   - ✅ ACID compliance
   - ✅ Relacional
   - ❌ Overhead para pub/sub
   - ❌ Performance inferior
   - **Rejeitado**: Não otimizado para real-time

2. **Memcached**
   - ✅ Muito rápido
   - ✅ Simples
   - ❌ Sem persistência
   - ❌ Sem clustering
   - **Rejeitado**: Falta funcionalidades

3. **Redis**
   - ✅ Pub/Sub nativo
   - ✅ Persistência opcional
   - ✅ Clustering
   - ✅ Alta performance
   - **Aceito**: Ideal para real-time

### **Decisão**

Usar **Redis 7** como backend para Centrifugo.

### **Justificativa**

1. **Performance**: 100k+ ops/sec
2. **Pub/Sub**: Suporte nativo a channels
3. **Persistência**: RDB + AOF para durability
4. **Clustering**: Redis Cluster para HA
5. **Ecosistema**: Integração nativa com Centrifugo

### **Configuração**

```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: >
    redis-server
    --appendonly yes
    --maxmemory 2gb
    --maxmemory-policy allkeys-lru
```

### **Uso por Funcionalidade**

```typescript
// 1. Pub/Sub para eventos
await redis.publish(channel, JSON.stringify(event));

// 2. Presence tracking
await redis.hset('presence:tenant-123', userId, JSON.stringify(presence));

// 3. Message history
await redis.lpush('history:tenant-123:deployments', JSON.stringify(message));

// 4. Rate limiting
await redis.incr('ratelimit:tenant-123');
await redis.expire('ratelimit:tenant-123', 60);
```

### **Consequências**

**Positivas:**
- ✅ Excellent performance
- ✅ Native Pub/Sub support
- ✅ Persistence options
- ✅ Clustering support
- ✅ Rich data structures

**Negativas:**
- ❌ In-memory (costly at scale)
- ❌ Single-threaded (use cluster)
- ❌ Persistence adds latency
- ❌ Need Redis expertise

---

## ADR-007: Testes Automatizados com WebSocket

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Como testar funcionalmente WebSockets e eventos real-time?

### **Alternativas Consideradas**

1. **Sem Testes Automatizados**
   - ✅ Simplicidade
   - ❌ Bugs não detectados
   - ❌ Regressões
   - **Rejeitado**: Inaceitável

2. **Mock WebSocket**
   - ✅ Rápido
   - ❌ Não testa integração real
   - ❌ Falsos positivos
   - **Rejeitado**: Não confiável

3. **Real WebSocket Connection**
   - ✅ Teste real
   - ✅ Confiança total
   - ✅ Integração completa
   - **Aceito**: Melhor abordagem

### **Decisão**

Usar **WebSocket real** em testes de integração.

### **Justificativa**

1. **Confiança**: Testa fluxo completo
2. **Detecção de Bugs**: Encontra problemas reais
3. **Cobertura**: End-to-end validation
4. **Debugging**: Logs reais ajudam em troubleshooting

### **Estrutura dos Testes**

```typescript
describe('Deployment Flow Integration', () => {
  let ws: WebSocket;
  let messages: any[] = [];

  beforeAll(async (done) => {
    // 1. Connect real WebSocket
    ws = new WebSocket('ws://localhost:8000/connection/websocket');

    ws.on('open', () => {
      // 2. Subscribe to channel
      ws.send(JSON.stringify({
        method: 'subscribe',
        params: { channel: 'tenant:test-123:deployments' }
      }));
      done();
    });

    // 3. Capture messages
    ws.on('message', (data) => {
      messages.push(JSON.parse(data.toString()));
    });
  });

  it('should publish and receive events', async () => {
    // 4. Publish event
    await deploymentPublisher.publishStart('test-123', 'deploy-456', 'odoo');

    // 5. Wait and verify
    await new Promise(resolve => setTimeout(resolve, 100));

    const message = messages.find(m => m.data?.type === 'deployment_start');
    expect(message).toBeDefined();
    expect(message.data.data.status).toBe('starting');
  });
});
```

### **Consequências**

**Positivas:**
- ✅ High confidence
- ✅ Real integration testing
- ✅ Catches real issues
- ✅ End-to-end validation

**Negativas:**
- ❌ Slower than mocks
- ❌ Requires running Centrifugo
- ❌ Network timing issues
- ❌ Flaky tests if not careful

---

## ADR-008: Monitoring com Prometheus + Grafana

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Como monitorar performance e saúde do sistema de eventos?

### **Alternativas Consideradas**

1. **Logs apenas**
   - ✅ Simples
   - ❌ Difícil de analisar
   - ❌ Sem métricas
   - **Rejeitado**: Insuficiente

2. **StatsD/Graphite**
   - ✅ Lightweight
   - ❌ Funcionalidades limitadas
   - ❌ Ecosistema menor
   - **Rejeitado**: Menos popular

3. **Prometheus + Grafana**
   - ✅ Standard da indústria
   - ✅ Dashboards ricos
   - ✅ Alertas poderosas
   - ✅ Ecosistema maduro
   - **Aceito**: De facto standard

### **Decisão**

Usar **Prometheus** para métricas e **Grafana** para visualização.

### **Justificativa**

1. **Padrão da Indústria**: Mais usado em microservices
2. **Ecosistema**: Muitos exporters prontos
3. **Dashboards**: Visualização rica e interativa
4. **Alertas**: Sistema robusto de alertas
5. **Cloud Native**: Suporte nativo a Kubernetes

### **Métricas Coletadas**

```typescript
export const metrics = {
  // Contadores
  eventsPublished: new Counter({
    name: 'events_published_total',
    help: 'Total number of events published',
    labelNames: ['channel', 'type', 'tenant_id']
  }),

  // Histogramas
  publishLatency: new Histogram({
    name: 'event_publish_duration_seconds',
    help: 'Time spent publishing events',
    buckets: [0.01, 0.05, 0.1, 0.5, 1]
  }),

  // Gauges
  activeConnections: new Gauge({
    name: 'active_connections',
    help: 'Number of active WebSocket connections'
  })
};
```

### **Dashboards**

1. **Event Flow Dashboard**
   - Publish/receive rates
   - Event types distribution
   - Tenant breakdown

2. **Performance Dashboard**
   - Latency percentiles
   - Throughput
   - Error rates

3. **System Dashboard**
   - CPU/Memory usage
   - Redis metrics
   - Connection counts

### **Consequências**

**Positivas:**
- ✅ Industry standard
- ✅ Rich visualization
- ✅ Powerful alerting
- ✅ Kubernetes native

**Negativas:**
- ❌ Setup complexity
- ❌ Resource overhead
- ❌ Learning curve
- ❌ Metric cardinality issues

---

## ADR-009: Deployment Strategy

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Como fazer deploy do sistema de eventos? Docker Compose vs Kubernetes?

### **Alternativas Consideradas**

1. **Docker Compose**
   - ✅ Simples de setup
   - ✅ Ideal para development
   - ❌ Sem auto-scaling
   - ❌ Sem self-healing
   - **Aceito**: Para development

2. **Kubernetes**
   - ✅ Auto-scaling
   - ✅ Self-healing
   - ✅ Production-ready
   - ❌ Complexidade alta
   - **Planejado**: Para production

### **Decisão**

Usar **Docker Compose** para desenvolvimento e **Kubernetes** para produção.

### **Justificativa**

1. **Development**: Compose é simples e rápido
2. **Production**: K8s oferece alta disponibilidade
3. **Flexibilidade**: Migrar quando necessário
4. **Custo**: Não pagar por K8s durante dev

### **Docker Compose (Development)**

```yaml
services:
  centrifugo:
    image: centrifugo/centrifugo:v3
    ports:
      - "8000:8000"
    volumes:
      - ./config/centrifugo.json:/centrifugo.json
    environment:
      - CENTRIFUGO_CONFIG=/centrifugo.json

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
```

### **Kubernetes (Production - Planejado)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: centrifugo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: centrifugo
  template:
    spec:
      containers:
      - name: centrifugo
        image: centrifugo/centrifugo:v3
        ports:
        - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: centrifugo
spec:
  selector:
    app: centrifugo
  ports:
  - port: 80
    targetPort: 8000
```

### **Consequências**

**Positivas:**
- ✅ Simple development setup
- ✅ Production-ready path
- ✅ Cost-effective
- ✅ Gradual migration

**Negativas:**
- ❌ Two deployment strategies
- ❌ Migration effort later
- ❌ Configuration differences
- ❌ Testing complexity

---

## ADR-010: Message History e Persistence

**Data**: 06 de Dezembro de 2025
**Status**: Aceito
**Decisor**: NeoAnd (Tech Lead)

### **Contexto**

Como persistir eventos para histórico e replay?

### **Alternativas Consideradas**

1. **Sem Persistência**
   - ✅ Simples
   - ❌ Eventos perdidos
   - ❌ Sem histórico
   - **Rejeitado**: Funcionalidade essencial

2. **PostgreSQL**
   - ✅ ACID compliance
   - ✅ Query flexibility
   - ❌ Overhead para real-time
   - ❌ Slower que Redis
   - **Rejeitado**: Performance

3. **Redis Lists**
   - ✅ Rápido
   - ✅ Estrutura nativa
   - ✅ TTL support
   - ✅ Bounded size
   - **Aceito**: Melhor custo-benefício

### **Decisão**

Usar **Redis Lists** para armazenamento de histórico.

### **Justificativa**

1. **Performance**: Redis é muito rápido
2. **Simplicidade**: Lists nativas do Redis
3. **TTL**: Expiração automática
4. **Bounded**: Limitar tamanho fácilmente
5. **Cost**: Menor que PostgreSQL

### **Implementação**

```typescript
export class HistoryService {
  async storeMessage(channel: string, type: string, data: any, userId?: string) {
    const message = {
      id: generateId(),
      channel,
      type,
      data,
      userId,
      timestamp: new Date().toISOString()
    };

    // Store in Redis list (keep last 100)
    await redis.lpush(`history:${channel}`, JSON.stringify(message));
    await redis.ltrim(`history:${channel}`, 0, 99);

    return message;
  }

  async getHistory(channel: string, limit: number = 50) {
    const messages = await redis.lrange(`history:${channel}`, 0, limit - 1);
    return messages.map(msg => JSON.parse(msg)).reverse();
  }
}
```

### **Estrutura do Histórico**

```json
{
  "id": "1701234567-abc123",
  "channel": "tenant:123:deployments",
  "type": "deployment_start",
  "data": {
    "tenantId": "123",
    "deploymentId": "deploy-456",
    "status": "starting",
    "progress": 0
  },
  "userId": "user-789",
  "timestamp": "2025-12-06T10:30:00Z"
}
```

### **Consequências**

**Positivas:**
- ✅ Fast access
- ✅ Automatic cleanup
- ✅ Bounded storage
- ✅ Simple API

**Negativas:**
- ❌ No complex queries
- ❌ Limited retention (100 messages)
- ❌ Redis memory usage
- ❌ No cross-channel search

---

## 📊 RESUMO DOS ADRs

| ADR | Título | Status | Impacto |
|-----|--------|--------|---------|
| 001 | Escolha do Centrifugo | Aceito | Alto |
| 002 | Padrão Multi-tenant | Aceito | Alto |
| 003 | Publisher/Subscriber | Aceito | Médio |
| 004 | Composables Pattern | Aceito | Médio |
| 005 | JWT Middleware | Aceito | Alto |
| 006 | Redis Backend | Aceito | Alto |
| 007 | WebSocket Testing | Aceito | Médio |
| 008 | Prometheus/Grafana | Aceito | Médio |
| 009 | Deployment Strategy | Aceito | Alto |
| 010 | Message History | Aceito | Médio |

---

## 🎯 PRÓXIMOS ADRs

**ADRs Futuros Planejados:**

1. **ADR-011**: Rate Limiting Strategy
2. **ADR-012**: Message Compression
3. **ADR-013**: Circuit Breaker Pattern
4. **ADR-014**: Event Sourcing
5. **ADR-015**: CQRS Implementation

---

**Desenvolvido por**: NeoAnd with ❤️ 🚀🚀🚀
**Data**: 06 de Dezembro de 2025
**Versão**: 1.0
