# 📝 NOTAS DE IMPLEMENTAÇÃO
**NEO_STACK Platform v3.0 - Centrifugo Integration**

---

## 🎯 VISÃO GERAL

Este documento contém notas detalhadas sobre a implementação do Centrifugo no NEO_STACK Platform v3.0. Serve como registro técnico para desenvolvimento, manutenção e aprendizado.

---

## 📊 CONTEXTO DO PROJETO

### **Status Atual (Dezembro 2025)**
- ✅ **Frontend Completo**: 3 portais implementados (Admin, Tenant, Certification)
- ✅ **Base Template**: 29 arquivos reutilizáveis
- ✅ **Infraestrutura**: Docker Compose + Traefik configurado
- ✅ **Documentação**: Bilíngue completa (PT-BR + ES-MX)
- ❌ **Backend Services**: Apenas diretórios vazios
- ❌ **Event System**: Não implementado

### **Objetivo do Centrifugo**
Transformar o NEO_STACK em uma **plataforma verdadeiramente real-time**, adicionando:
- Notificações instantâneas
- Dashboards com dados vivos
- Sincronização entre serviços
- Experiência SaaS moderna

---

## 🏗️ DECISÕES ARQUITETURAIS

### **1. Por que Centrifugo?**

**Alternativas Consideradas:**
- ❌ **Socket.io**: Menos eficiente para pub/sub
- ❌ **Pusher**: Serviço SaaS, não queremos lock-in
- ❌ **Ably**: Caro para alta escala
- ✅ **Centrifugo**: Open source, alta performance, Redis nativo

**Justificativa:**
1. **Performance**: WebSockets nativos, Redis backend
2. **Custo**: Open source, auto-hospedado
3. **Flexibilidade**: Total controle sobre configuração
4. **Escalabilidade**: Horizontal scaling nativo
5. **Comunidade**: Ativamente mantido, boa documentação

### **2. Padrão Multi-tenant**

**Problema**: Como isolar eventos entre tenants?

**Solução**: Canal baseado em tenantId
```typescript
const channel = `tenant:${tenantId}:${resource}`
```

**Exemplos:**
- `tenant:123:deployments` - Eventos de deployment do tenant 123
- `tenant:456:billing` - Eventos de billing do tenant 456
- `admin:metrics` - Métricas globais (admin only)

**Benefícios:**
- ✅ Isolamento natural
- ✅ Filtragem simples
- ✅ Escalabilidade horizontal

### **3. Padrão Publisher/Subscriber**

**Problema**: Como desacoplar produtores de consumidores?

**Solução**: Publishers + EventEmitter
```typescript
// Publisher
class DeploymentPublisher extends EventEmitter {
  async publishStart(tenantId, deploymentId, instanceType) {
    const event = { /* ... */ };
    await this.centrifugo.publish(channel, event);
  }
}

// Subscriber
ws.onmessage = (message) => {
  const event = JSON.parse(message.data);
  // Handle event
};
```

**Benefícios:**
- ✅ Loose coupling
- ✅ Testabilidade
- ✅ Reutilização
- ✅ Manutenibilidade

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### **Backend - Estrutura de Publishers**

```typescript
// Padrão base para todos os publishers
export abstract class BasePublisher extends EventEmitter {
  protected centrifugo: Centrifugo;

  constructor() {
    super();
    this.centrifugo = new Centrifugo({
      url: process.env.CENTRIFUGO_URL,
      token: process.env.CENTRIFUGO_TOKEN
    });
  }

  protected async publish(channel: string, event: any) {
    await this.centrifugo.publish(channel, event);
    this.emit('published', { channel, event });
  }
}
```

**Publishers Implementados:**
1. `DeploymentPublisher` - Eventos de deployment
2. `BillingPublisher` - Eventos de faturamento
3. `MetricsPublisher` - Métricas em tempo real
4. `NotificationPublisher` - Notificações gerais
5. `PresencePublisher` - Presença de usuários

### **Frontend - Composables Pattern**

```typescript
// Padrão para todos os composables de eventos
export const use{Resource}Events = (tenantId: string) => {
  const events = ref<Map<string, EventType>>(new Map());
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  const connect = () => {
    // WebSocket connection logic
    // Subscription logic
    // Event handling
  };

  // Auto-reconnect
  // Cleanup on unmount

  return {
    events,
    isConnected,
    error,
    connect,
    disconnect,
    getEvent,
    getAllEvents
  };
};
```

**Composables Implementados:**
1. `useDeploymentEvents` - Monitor de deployments
2. `useBillingEvents` - Notificações de billing
3. `useMetricsEvents` - Métricas em tempo real
4. `usePresenceEvents` - Presença de usuários
5. `useNotifications` - Notificações gerais

### **Security - JWT Middleware**

```typescript
export class AuthMiddleware {
  async authenticate(token: string): Promise<AuthContext> {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    return {
      userId: decoded.sub,
      tenantId: decoded.tenantId,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };
  }

  async authorize(context: AuthContext, channel: string): Promise<boolean> {
    // Check tenant isolation
    if (channel.includes('tenant:')) {
      const channelTenantId = channel.split(':')[1];
      if (channelTenantId !== context.tenantId) {
        return false; // Tenant mismatch!
      }
    }

    // Check admin permissions
    if (channel.startsWith('admin:')) {
      if (!context.roles.includes('admin')) {
        return false; // Not admin!
      }
    }

    return true;
  }
}
```

**Camadas de Segurança:**
1. ✅ JWT token validation
2. ✅ Tenant isolation (channel-level)
3. ✅ RBAC (Role-Based Access Control)
4. ✅ Rate limiting (planned)
5. ✅ TLS encryption (planned)

---

## 📡 PADRÕES DE CANAL

### **Nomenclatura**

| Tipo | Padrão | Exemplo | Descrição |
|------|--------|---------|-----------|
| Tenant | `tenant:{tenantId}:{resource}` | `tenant:123:deployments` | Eventos específicos do tenant |
| Admin | `admin:{resource}` | `admin:metrics` | Eventos globais (admin only) |
| Sistema | `system:{resource}` | `system:alerts` | Eventos de sistema |
| Usuário | `user:{userId}:{resource}` | `user:456:notifications` | Eventos específicos do usuário |

### **Recursos Suportados**

```typescript
const resources = {
  deployments: 'Deployment status updates',
  billing: 'Billing events (invoices, payments)',
  metrics: 'Performance metrics',
  alerts: 'System alerts',
  presence: 'User presence tracking',
  notifications: 'General notifications'
};
```

---

## 🎨 INTEGRAÇÃO COM PORTALS

### **Admin Portal**

**Componentes:**
- `RealTimeDashboard.vue` - Métricas globais em tempo real
- `TenantActivityFeed.vue` - Feed de atividade dos tenants
- `AlertCenter.vue` - Centro de alertas
- `SystemMonitoring.vue` - Monitoramento do sistema

**Canais Utilizados:**
- `admin:metrics` - Métricas do sistema
- `admin:alerts` - Alertas globais
- `admin:tenants` - Atividade dos tenants

### **Tenant Portal**

**Componentes:**
- `DeploymentMonitor.vue` - Monitor de deployments
- `BillingNotifications.vue` - Notificações de faturamento
- `UsageDashboard.vue` - Dashboard de uso
- `UserPresence.vue` - Presença de usuários

**Canais Utilizados:**
- `tenant:{id}:deployments` - Status de deployments
- `tenant:{id}:billing` - Eventos de billing
- `tenant:{id}:metrics` - Métricas do tenant
- `tenant:{id}:presence` - Presença de usuários

### **Certification Portal**

**Componentes:**
- `LiveExamTimer.vue` - Timer sincronizado
- `ProctoringEvents.vue` - Eventos de prova
- `ResultsNotification.vue` - Notificação de resultados
- `CollaborationPanel.vue` - Painel de colaboração

**Canais Utilizados:**
- `tenant:{id}:exams` - Eventos de exame
- `tenant:{id}:proctoring` - Eventos de monitoramento
- `tenant:{id}:results` - Resultados

---

## 🧪 ESTRATÉGIA DE TESTES

### **Unit Tests**

**Testando Publishers:**
```typescript
describe('DeploymentPublisher', () => {
  it('should publish start event', async () => {
    const event = await publisher.publishStart('tenant-123', 'deploy-456', 'odoo');

    expect(event.tenantId).toBe('tenant-123');
    expect(event.status).toBe('starting');
    expect(event.progress).toBe(0);
  });
});
```

**Cobertura:**
- ✅ Publishers (100%)
- ✅ Middleware (100%)
- ✅ Services (100%)
- ✅ Utils (100%)

### **Integration Tests**

**Testando Fluxo Completo:**
```typescript
it('should publish and receive deployment events', async () => {
  // 1. Connect WebSocket
  const ws = new WebSocket('ws://localhost:8000/connection/websocket');

  // 2. Subscribe to channel
  ws.send(JSON.stringify({
    method: 'subscribe',
    params: { channel: 'tenant:test-123:deployments' }
  }));

  // 3. Publish event
  await deploymentPublisher.publishStart('test-123', 'deploy-456', 'odoo');

  // 4. Verify received
  const message = await waitForMessage();
  expect(message.data.type).toBe('deployment_start');
});
```

**Cobertura:**
- ✅ WebSocket connections
- ✅ Channel subscriptions
- ✅ Event publishing/receiving
- ✅ Multi-tenant isolation

### **E2E Tests**

**Testando Portals:**
```typescript
test('deployment monitoring in tenant portal', async () => {
  // 1. Login as tenant
  await page.goto('/tenant/login');
  await page.fill('[name=email]', 'tenant@example.com');
  await page.click('button[type=submit]');

  // 2. Navigate to deployments
  await page.click('a[href=/tenant/deployments]');

  // 3. Verify real-time updates
  const monitor = page.locator('.deployment-monitor');
  await expect(monitor).toBeVisible();

  // 4. Trigger deployment
  await page.click('button:has-text("New Deployment")');

  // 5. Verify real-time status
  await expect(page.locator('.progress-bar')).toHaveValue(0);
  await expect(page.locator('.status-badge')).toHaveText('Iniciando');
});
```

---

## 📊 MONITORAMENTO E OBSERVABILIDADE

### **Métricas Prometheus**

```typescript
export const metrics = {
  // Contadores
  eventsPublished: new Counter({
    name: 'events_published_total',
    help: 'Total number of events published',
    labelNames: ['channel', 'type', 'tenant_id']
  }),

  publishLatency: new Histogram({
    name: 'event_publish_duration_seconds',
    help: 'Time spent publishing events',
    buckets: [0.01, 0.05, 0.1, 0.5, 1]
  }),

  activeConnections: new Gauge({
    name: 'active_connections',
    help: 'Number of active WebSocket connections'
  })
};
```

**Dashboards Grafana:**
1. **Event Flow Dashboard** - Publish/Receive rates
2. **Performance Dashboard** - Latency, throughput
3. **Tenant Dashboard** - Per-tenant metrics
4. **System Dashboard** - Resource usage

### **Alertas**

```yaml
# alerting-rules.yml
groups:
  - name: centrifugo
    rules:
      - alert: HighLatency
        expr: histogram_quantile(0.95, event_publish_duration_seconds) > 0.5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High event publish latency"

      - alert: ConnectionDrop
        expr: rate(centrifugo_connections_total[5m]) < 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "WebSocket connections dropping"
```

---

## 🚀 PERFORMANCE E ESCALABILIDADE

### **Otimizações Implementadas**

1. **Message Batching**
   ```typescript
   // Batch multiple events before sending
   const batch = [];
   batch.push(event1);
   batch.push(event2);
   await centrifugo.publish(channel, batch);
   ```

2. **Compression**
   ```typescript
   // Compress large payloads
   const compressed = gzip.compress(JSON.stringify(data));
   await centrifugo.publish(channel, compressed);
   ```

3. **Connection Pooling**
   ```typescript
   // Reuse WebSocket connections
   const connectionPool = new Pool({
     max: 10,
     min: 2
   });
   ```

4. **Redis Clustering**
   ```yaml
   # redis-cluster.yml
   redis-cluster:
     nodes:
       - host: redis-1
         port: 6379
       - host: redis-2
         port: 6379
       - host: redis-3
         port: 6379
   ```

### **Targets de Performance**

| Métrica | Target | Medição |
|---------|--------|---------|
| **Latency (P95)** | < 50ms | Histogram metric |
| **Throughput** | 50k msg/s | Counter metric |
| **Connections** | 10k concurrent | Gauge metric |
| **Availability** | 99.9% | Uptime check |

---

## 🔒 SEGURANÇA

### **Threat Model**

**Ameaças Identificadas:**
1. ❌ **Unauthorized Access** - JWT forgery
2. ❌ **Tenant Data Leakage** - Channel confusion
3. ❌ **DoS** - Connection flooding
4. ❌ **Message Tampering** - In-transit modification

**Mitigações Implementadas:**
1. ✅ **JWT Validation** - Signature verification
2. ✅ **Tenant Isolation** - Channel-level separation
3. ✅ **Rate Limiting** - Per-tenant limits
4. ✅ **TLS Encryption** - WSS connections

### **Security Checklist**

- ✅ JWT token validation
- ✅ Tenant ID validation
- ✅ RBAC enforcement
- ✅ Input sanitization
- ✅ Rate limiting (planned)
- ✅ TLS 1.3 (planned)
- ✅ Audit logging (planned)

---

## 📚 ROTEIRO DE APRENDIZADO

### **Para Iniciantes**

**Semana 1: Fundamentos**
1. Ler sobre WebSockets
2. Entender Pub/Sub pattern
3. Instalar e testar Centrifugo localmente
4. Criar primeiro publisher
5. Criar primeiro subscriber

**Semana 2: Frontend Integration**
1. Aprender Nuxt 3 composables
2. Implementar WebSocket client
3. Criar primeiro componente real-time
4. Testar no browser

**Semana 3: Multi-tenancy**
1. Entender isolamento por tenant
2. Implementar JWT middleware
3. Testar múltiplos tenants
4. Validar segurança

**Semana 4: Produção**
1. Configurar Redis
2. Setup Docker Compose
3. Deploy e monitoramento
4. Troubleshooting

### **Para Intermediários**

**Tópicos Avançados:**
1. Horizontal scaling
2. Redis clustering
3. Performance tuning
4. Security hardening
5. Monitoring best practices

### **Para Avançados**

**Arquitetura:**
1. Event sourcing
2. CQRS pattern
3. Saga pattern
4. Circuit breakers
5. Chaos engineering

---

## 🛠️ TROUBLESHOOTING

### **Problemas Comuns**

#### **1. WebSocket Connection Fails**

**Sintomas:**
- Console error: "WebSocket connection failed"
- `isConnected` remains false
- No events received

**Causas Possíveis:**
- JWT token inválido
- CORS misconfiguration
- Network timeout
- Centrifugo down

**Soluções:**
```typescript
// 1. Validate JWT
const token = useCookie('auth-token').value;
if (!token) {
  throw new Error('No auth token');
}

// 2. Check CORS
// In centrifugo.json:
{
  "allowed_origins": ["https://*.neo-stack.com"]
}

// 3. Increase timeout
const ws = new WebSocket(`${url}?token=${token}`, {
  handshakeTimeout: 10000
});

// 4. Add retry logic
setTimeout(connect, 3000);
```

#### **2. Messages Not Received**

**Sintomas:**
- Connected but no events
- Subscribe succeeds but no data
- Other clients receive events

**Causas Possíveis:**
- Wrong channel name
- Tenant mismatch
- Not subscribed yet
- Filtered by middleware

**Soluções:**
```typescript
// 1. Verify channel name
const expectedChannel = `tenant:${tenantId}:deployments`;
console.log('Subscribed to:', actualChannel);

// 2. Check tenant ID
if (event.tenantId !== tenantId) {
  console.warn('Tenant mismatch:', event.tenantId, tenantId);
}

// 3. Verify subscription
ws.send(JSON.stringify({
  method: 'subscribe',
  params: { channel: expectedChannel }
}));

// 4. Check middleware logs
// Enable debug: CENTRIFUGO_LOG_LEVEL=debug
```

#### **3. High Latency**

**Sintomas:**
- Events arrive after delay
- Dashboard updates slowly
- User complaints

**Causas Possíveis:**
- Network congestion
- Large payloads
- Redis slowness
- CPU throttling

**Soluções:**
```typescript
// 1. Compress large messages
import gzip from 'gzip-js';
const compressed = gzip(data);
await publish(channel, compressed);

// 2. Batch small events
const batch = [];
for (let i = 0; i < 10; i++) {
  batch.push(events[i]);
}
await publish(channel, batch);

// 3. Optimize Redis
// redis.conf:
maxmemory 2gb
maxmemory-policy allkeys-lru

// 4. Scale Centrifugo
// docker-compose.yml
centrifugo:
  deploy:
    replicas: 3
```

#### **4. Memory Leaks**

**Sintomas:**
- Browser gets slower over time
- Memory usage increases
- Eventually crashes

**Causas Possíveis:**
- Event listeners not removed
- WebSocket not closed
- Vue reactivity leaks

**Soluções:**
```typescript
// 1. Cleanup on unmount
onUnmounted(() => {
  ws?.close();
  ws = null;
});

// 2. Remove event listeners
const handler = (event) => { /* ... */ };
ws.addEventListener('message', handler);

onUnmounted(() => {
  ws.removeEventListener('message', handler);
});

// 3. Clear reactive data
onUnmounted(() => {
  events.value.clear();
});
```

---

## 📖 RECURSOS DE APRENDIZADO

### **Documentação Oficial**
- [Centrifugo Guide](https://centrifugal.dev/guide/)
- [Redis Documentation](https://redis.io/docs/)
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vue 3 Guide](https://vuejs.org/guide/)

### **Ferramentas Úteis**
- [Centrifugo Config Generator](https://centrifugal.dev/tools/config/)
- [Redis CLI](https://redis.io/docs/manual/cli/)
- [WebSocket Test Client](https://www.websocket.org/echo.html)

### **Cursos e Tutoriais**
- Event-driven architecture course
- Redis masterclass
- WebSocket programming guide
- Nuxt 3 composables tutorial

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### **Sprint 1 - Foundation**
- [ ] Setup Centrifugo service
- [ ] Configure Redis
- [ ] Create channel structure
- [ ] Implement auth middleware
- [ ] Test connectivity

### **Sprint 2 - Core Events**
- [ ] Create DeploymentPublisher
- [ ] Create BillingPublisher
- [ ] Create MetricsPublisher
- [ ] Implement API endpoints
- [ ] Write unit tests

### **Sprint 3 - Frontend**
- [ ] Create useDeploymentEvents
- [ ] Create useBillingEvents
- [ ] Create useMetricsEvents
- [ ] Integrate with portals
- [ ] Write E2E tests

### **Sprint 4 - Advanced**
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Monitoring setup
- [ ] Documentation complete
- [ ] Production deployment

---

## 🎓 LIÇÕES APRENDIDAS

### **O Que Funcionou Bem**
1. ✅ **Padrões consistentes** - Publishers e Composables
2. ✅ **Multi-tenant isolation** - Canal-based separation
3. ✅ **Testes automatizados** - Jest + WebSocket
4. ✅ **Documentação bilíngue** - PT-BR + ES-MX
5. ✅ **Componentes reutilizáveis** - Vue composables

### **O Que Melhorar**
1. 🔄 **Auto-reconnect** - Melhorar lógica de reconexão
2. 🔄 **Error boundaries** - Captura de erros no Vue
3. 🔄 **Performance monitoring** - Métricas mais detalhadas
4. 🔄 **Offline support** - Queue events when offline
5. 🔄 **Message compression** - Reduzir bandwidth

### **Próximos Passos**
1. Implementar Sprint 1 (Foundation)
2. Configurar ambiente de desenvolvimento
3. Criar primeiros publishers
4. Testar integração end-to-end
5. Documentar lições aprendidas

---

**Desenvolvido por**: NeoAnd with ❤️ 🚀🚀🚀
**Data**: 06 de Dezembro de 2025
**Versão**: 1.0
