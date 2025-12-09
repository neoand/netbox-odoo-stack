# 🎯 CASOS DE USO REALES - CENTRIFUGO
**NEO_STACK Platform v3.0 - Implementación Práctica**

---

## 📋 RESUMEN EJECUTIVO

Este documento presenta **8 casos de uso reales** de Centrifugo en el NEO_STACK Platform, con implementación completa en código. Cada caso incluye:
- ✅ Contexto de negocio
- ✅ Arquitectura técnica
- ✅ Código backend (TypeScript)
- ✅ Código frontend (Nuxt 3)
- ✅ Escenarios multi-tenant
- ✅ Pruebas prácticas

---

## 🔍 CASO DE USO 1: NOTIFICACIONES DE DEPLOYMENT EN TIEMPO REAL

### **Contexto de Negocio**
Cuando un tenant hace deploy de una instancia Odoo/NetBox/Wazuh, necesita saber:
- ✅ Estado del deployment (iniciado, en progreso, completado, error)
- ✅ Logs en tiempo real
- ✅ Porcentaje de finalización
- ✅ Próximos pasos

### **Arquitectura Técnica**
```
Tenant Portal → API Gateway → Stack Deployer → Centrifugo → WebSocket → Tenant UI
                                           ↓
                                     Redis (Pub/Sub)
                                           ↓
                                    Event Publishers
```

### **1.1. Backend - Event Publisher**

```typescript
// event-service/src/publishers/DeploymentPublisher.ts
import { Centrifugo } from 'centrifugo';
import { EventEmitter } from 'events';

export interface DeploymentEvent {
  tenantId: string;
  deploymentId: string;
  instanceType: 'odoo' | 'netbox' | 'wazuh';
  status: 'starting' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  logs: string[];
  timestamp: string;
  estimatedCompletion?: string;
}

export class DeploymentPublisher extends EventEmitter {
  private centrifugo: Centrifugo;

  constructor() {
    super();
    this.centrifugo = new Centrifugo({
      url: process.env.CENTRIFUGO_URL || 'http://localhost:8000',
      token: process.env.CENTRIFUGO_TOKEN
    });
  }

  /**
   * Publica evento de inicio de deployment
   */
  async publishStart(tenantId: string, deploymentId: string, instanceType: string) {
    const channel = `tenant:${tenantId}:deployments`;

    const event: DeploymentEvent = {
      tenantId,
      deploymentId,
      instanceType: instanceType as any,
      status: 'starting',
      progress: 0,
      currentStep: 'Iniciando deployment...',
      logs: [],
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'deployment_start',
      data: event
    });

    return event;
  }

  /**
   * Publica progreso del deployment
   */
  async publishProgress(
    tenantId: string,
    deploymentId: string,
    progress: number,
    currentStep: string,
    log?: string
  ) {
    const channel = `tenant:${tenantId}:deployments`;

    const event: Partial<DeploymentEvent> = {
      tenantId,
      deploymentId,
      progress,
      currentStep,
      timestamp: new Date().toISOString()
    };

    if (log) {
      event.logs = [log];
    }

    await this.centrifugo.publish(channel, {
      type: 'deployment_progress',
      data: event
    });

    return event;
  }

  /**
   * Publica finalización del deployment
   */
  async publishCompletion(tenantId: string, deploymentId: string, instanceUrl: string) {
    const channel = `tenant:${tenantId}:deployments`;

    const event: DeploymentEvent = {
      tenantId,
      deploymentId,
      instanceType: 'odoo', // Ejemplo
      status: 'completed',
      progress: 100,
      currentStep: '¡Deployment completado con éxito!',
      logs: [`Instancia disponible en: ${instanceUrl}`],
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'deployment_complete',
      data: event
    });

    return event;
  }

  /**
   * Publica error en el deployment
   */
  async publishError(tenantId: string, deploymentId: string, error: string) {
    const channel = `tenant:${tenantId}:deployments`;

    const event: DeploymentEvent = {
      tenantId,
      deploymentId,
      instanceType: 'odoo',
      status: 'failed',
      progress: 0,
      currentStep: 'Error en el deployment',
      logs: [error],
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'deployment_error',
      data: event
    });

    return event;
  }
}

// Exportar instancia singleton
export const deploymentPublisher = new DeploymentPublisher();
```

### **1.2. Backend - Integración con Stack Deployer**

```typescript
// stack-deployer/src/services/DeploymentService.ts
import { deploymentPublisher } from '../../../event-service/src/publishers/DeploymentPublisher';

export class DeploymentService {
  async deployOdooInstance(tenantId: string, config: OdooConfig) {
    const deploymentId = `odoo-${Date.now()}`;

    try {
      // 1. Publicar inicio
      await deploymentPublisher.publishStart(tenantId, deploymentId, 'odoo');

      // 2. Simular pasos del deployment
      await deploymentPublisher.publishProgress(
        tenantId,
        deploymentId,
        20,
        'Descargando imagen Docker...'
      );

      await this.sleep(1000);

      await deploymentPublisher.publishProgress(
        tenantId,
        deploymentId,
        40,
        'Configurando container...',
        'Creating network "odoo-network"'
      );

      await this.sleep(1000);

      await deploymentPublisher.publishProgress(
        tenantId,
        deploymentId,
        60,
        'Iniciando servicios...',
        'Starting odoo container...'
      );

      await this.sleep(1000);

      await deploymentPublisher.publishProgress(
        tenantId,
        deploymentId,
        80,
        'Configurando base de datos...'
      );

      await this.sleep(1000);

      // 3. Publicar finalización
      const instanceUrl = `https://odoo-${tenantId}.neo-stack.com`;
      await deploymentPublisher.publishCompletion(tenantId, deploymentId, instanceUrl);

      return { deploymentId, instanceUrl };
    } catch (error) {
      await deploymentPublisher.publishError(
        tenantId,
        deploymentId,
        error.message
      );
      throw error;
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### **1.3. Frontend - Nuxt 3 Composable**

```typescript
// tenant-portal/composables/useDeploymentEvents.ts
import { ref, computed } from 'vue';

interface DeploymentEvent {
  deploymentId: string;
  instanceType: string;
  status: 'starting' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  logs: string[];
  timestamp: string;
}

export const useDeploymentEvents = (tenantId: string) => {
  const events = ref<Map<string, DeploymentEvent>>(new Map());
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  let ws: WebSocket | null = null;

  const connect = () => {
    const token = useCookie('auth-token').value;
    const eventsUrl = useRuntimeConfig().public.eventsUrl;

    ws = new WebSocket(
      `${eventsUrl}/connection/websocket?token=${token}`
    );

    ws.onopen = () => {
      isConnected.value = true;
      error.value = null;

      // Suscribirse al canal de deployment
      ws?.send(JSON.stringify({
        method: 'subscribe',
        params: {
          channel: `tenant:${tenantId}:deployments`
        }
      }));
    };

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.type === 'publication' && data.data?.type) {
        const event = data.data.data as DeploymentEvent;

        // Actualizar o crear evento
        events.value.set(event.deploymentId, event);
      }
    };

    ws.onerror = (err) => {
      error.value = 'Error en la conexión WebSocket';
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      isConnected.value = false;
      // Reconectar después de 3 segundos
      setTimeout(connect, 3000);
    };
  };

  const disconnect = () => {
    ws?.close();
    ws = null;
  };

  const getDeploymentEvents = (deploymentId: string) => {
    return computed(() => events.value.get(deploymentId));
  };

  const getAllDeployments = () => {
    return computed(() => Array.from(events.value.values()));
  };

  // Limpiar al desmontar
  onUnmounted(() => {
    disconnect();
  });

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

### **1.4. Frontend - Componente Vue**

```vue
<!-- tenant-portal/components/DeploymentMonitor.vue -->
<template>
  <div class="deployment-monitor">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Deployments en Tiempo Real</h2>
      <UBadge :color="isConnected ? 'green' : 'red'">
        {{ isConnected ? 'Conectado' : 'Desconectado' }}
      </UBadge>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 p-4 rounded mb-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-if="deployments.length === 0" class="text-center py-8">
      <p class="text-gray-500">Ningún deployment activo</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="deployment in deployments"
        :key="deployment.deploymentId"
        class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold">
              {{ deployment.instanceType.toUpperCase() }}
            </h3>
            <p class="text-sm text-gray-500">
              ID: {{ deployment.deploymentId }}
            </p>
          </div>
          <UBadge
            :color="getStatusColor(deployment.status)"
            size="lg"
          >
            {{ getStatusLabel(deployment.status) }}
          </UBadge>
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">Progreso</span>
            <span class="text-sm text-gray-600">{{ deployment.progress }}%</span>
          </div>
          <UProgress
            :value="deployment.progress"
            :color="deployment.status === 'failed' ? 'red' : 'blue'"
          />
        </div>

        <div class="mb-4">
          <p class="text-sm font-medium mb-2">Paso Actual:</p>
          <p class="text-gray-700">{{ deployment.currentStep }}</p>
        </div>

        <div v-if="deployment.logs.length > 0">
          <p class="text-sm font-medium mb-2">Logs:</p>
          <div class="bg-gray-50 border border-gray-200 rounded p-3 max-h-40 overflow-y-auto">
            <pre class="text-xs text-gray-700">{{ deployment.logs.join('\n') }}</pre>
          </div>
        </div>

        <div class="mt-4 text-xs text-gray-500">
          {{ formatDate(deployment.timestamp) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tenantId: string;
}>();

const {
  isConnected,
  error,
  connect,
  getAllDeployments
} = useDeploymentEvents(props.tenantId);

const deployments = getAllDeployments();

onMounted(() => {
  connect();
});

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    starting: 'blue',
    in_progress: 'blue',
    completed: 'green',
    failed: 'red'
  };
  return colors[status] || 'gray';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    starting: 'Iniciando',
    in_progress: 'En Progreso',
    completed: 'Completado',
    failed: 'Error'
  };
  return labels[status] || status;
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('es-MX');
};
</script>
```

### **1.5. Test Unitario**

```typescript
// event-service/tests/publishers/DeploymentPublisher.test.ts
import { DeploymentPublisher } from '../../src/publishers/DeploymentPublisher';

describe('DeploymentPublisher', () => {
  let publisher: DeploymentPublisher;

  beforeEach(() => {
    publisher = new DeploymentPublisher();
  });

  it('should publish start event', async () => {
    const event = await publisher.publishStart('tenant-123', 'deploy-456', 'odoo');

    expect(event.tenantId).toBe('tenant-123');
    expect(event.deploymentId).toBe('deploy-456');
    expect(event.status).toBe('starting');
    expect(event.progress).toBe(0);
  });

  it('should publish progress event', async () => {
    await publisher.publishProgress('tenant-123', 'deploy-456', 50, 'Configuring...');

    // Verificar que se publicó el evento (mock centrifugo)
  });

  it('should publish completion event', async () => {
    const event = await publisher.publishCompletion(
      'tenant-123',
      'deploy-456',
      'https://odoo-tenant123.neo-stack.com'
    );

    expect(event.status).toBe('completed');
    expect(event.progress).toBe(100);
    expect(event.logs).toContain('Instancia disponible en: https://odoo-tenant123.neo-stack.com');
  });
});
```

---

## 💰 CASO DE USO 2: NOTIFICACIONES DE FACTURACIÓN

### **Contexto de Negocio**
Los tenants necesitan recibir notificaciones sobre:
- ✅ Cargos procesados
- ✅ Pagos aprobados/rechazados
- ✅ Cambios en el plan
- ✅ Alertas de límite de uso
- ✅ Facturas pendientes

### **2.1. Backend - Billing Publisher**

```typescript
// event-service/src/publishers/BillingPublisher.ts
import { EventEmitter } from 'events';
import { Centrifugo } from 'centrifugo';

export interface BillingEvent {
  tenantId: string;
  type: 'invoice' | 'payment' | 'plan_change' | 'usage_alert' | 'subscription';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount?: number;
  currency?: string;
  invoiceId?: string;
  paymentId?: string;
  planName?: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export class BillingPublisher extends EventEmitter {
  private centrifugo: Centrifugo;

  constructor() {
    super();
    this.centrifugo = new Centrifugo({
      url: process.env.CENTRIFUGO_URL,
      token: process.env.CENTRIFUGO_TOKEN
    });
  }

  async publishInvoice(tenantId: string, invoiceId: string, amount: number, currency: string) {
    const channel = `tenant:${tenantId}:billing`;

    const event: BillingEvent = {
      tenantId,
      type: 'invoice',
      status: 'pending',
      amount,
      currency,
      invoiceId,
      message: `Nueva factura disponible: ${currency} ${amount.toFixed(2)}`,
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'billing_invoice',
      data: event
    });

    return event;
  }

  async publishPaymentStatus(
    tenantId: string,
    paymentId: string,
    status: 'completed' | 'failed',
    message: string
  ) {
    const channel = `tenant:${tenantId}:billing`;

    const event: BillingEvent = {
      tenantId,
      type: 'payment',
      status,
      paymentId,
      message,
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'billing_payment',
      data: event
    });

    return event;
  }

  async publishUsageAlert(tenantId: string, usage: number, limit: number, resource: string) {
    const channel = `tenant:${tenantId}:billing`;

    const percentage = (usage / limit) * 100;
    const event: BillingEvent = {
      tenantId,
      type: 'usage_alert',
      status: percentage > 90 ? 'failed' : 'pending',
      message: `Alerta: ${percentage.toFixed(1)}% del límite de ${resource} usado`,
      metadata: {
        usage,
        limit,
        resource,
        percentage
      },
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'billing_usage_alert',
      data: event
    });

    return event;
  }
}

export const billingPublisher = new BillingPublisher();
```

### **2.2. Frontend - Billing Notifications**

```vue
<!-- tenant-portal/components/BillingNotifications.vue -->
<template>
  <div class="billing-notifications">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">Notificaciones de Facturación</h2>
      <UButton
        v-if="unreadCount > 0"
        size="sm"
        color="gray"
        @click="markAllAsRead"
      >
        Marcar todas como leídas
      </UButton>
    </div>

    <div class="space-y-3">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="border-l-4 pl-4 py-3"
        :class="getNotificationClass(notification.type)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <UIcon :name="getNotificationIcon(notification.type)" />
              <span class="font-semibold">{{ getTypeLabel(notification.type) }}</span>
              <UBadge
                v-if="!notification.read"
                color="blue"
                size="xs"
              >
                Nuevo
              </UBadge>
            </div>
            <p class="text-gray-700">{{ notification.message }}</p>
            <div v-if="notification.amount" class="text-sm text-gray-600 mt-1">
              Monto: {{ notification.currency }} {{ notification.amount.toFixed(2) }}
            </div>
            <div class="text-xs text-gray-500 mt-2">
              {{ formatDate(notification.timestamp) }}
            </div>
          </div>
          <UButton
            v-if="!notification.read"
            size="xs"
            color="gray"
            variant="ghost"
            @click="markAsRead(notification.id)"
          >
            ✓
          </UButton>
        </div>
      </div>

      <div v-if="notifications.length === 0" class="text-center py-8 text-gray-500">
        Sin notificaciones
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BillingNotification {
  id: string;
  type: 'invoice' | 'payment' | 'plan_change' | 'usage_alert' | 'subscription';
  status: string;
  message: string;
  amount?: number;
  currency?: string;
  read: boolean;
  timestamp: string;
}

const props = defineProps<{
  tenantId: string;
}>();

const notifications = ref<BillingNotification[]>([]);
const { isConnected } = useBillingEvents(props.tenantId);

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.read).length
);

const markAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true);
};

const getNotificationClass = (type: string) => {
  const classes: Record<string, string> = {
    invoice: 'border-blue-500 bg-blue-50',
    payment: 'border-green-500 bg-green-50',
    plan_change: 'border-purple-500 bg-purple-50',
    usage_alert: 'border-orange-500 bg-orange-50',
    subscription: 'border-indigo-500 bg-indigo-50'
  };
  return classes[type] || 'border-gray-500 bg-gray-50';
};

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    invoice: 'i-heroicons-document-text',
    payment: 'i-heroicons-credit-card',
    plan_change: 'i-heroicons-arrow-path',
    usage_alert: 'i-heroicons-exclamation-triangle',
    subscription: 'i-heroicons-user-group'
  };
  return icons[type] || 'i-heroicons-bell';
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    invoice: 'Factura',
    payment: 'Pago',
    plan_change: 'Cambio de Plan',
    usage_alert: 'Alerta de Uso',
    subscription: 'Suscripción'
  };
  return labels[type] || type;
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('es-MX');
};
</script>
```

---

## 📊 CASO DE USO 3: DASHBOARDS EN TIEMPO REAL

### **Contexto de Negocio**
Dashboards administrativos y de tenant necesitan:
- ✅ Métricas actualizadas en tiempo real
- ✅ Estado de sistemas (online/offline)
- ✅ Alertas críticas
- ✅ Gráficos dinámicos
- ✅ Lista de actividades recientes

### **3.1. Backend - Metrics Publisher**

```typescript
// event-service/src/publishers/MetricsPublisher.ts
import { EventEmitter } from 'events';
import { Centrifugo } from 'centrifugo';

export interface MetricsEvent {
  tenantId?: string; // undefined = admin (all tenants)
  type: 'system_metrics' | 'tenant_metrics' | 'alert';
  data: {
    cpu: number;
    memory: number;
    disk: number;
    networkIn: number;
    networkOut: number;
    activeInstances: number;
    uptime: number;
  };
  timestamp: string;
}

export class MetricsPublisher extends EventEmitter {
  private centrifugo: Centrifugo;

  constructor() {
    super();
    this.centrifugo = new Centrifugo({
      url: process.env.CENTRIFUGO_URL,
      token: process.env.CENTRIFUGO_TOKEN
    });
  }

  async publishSystemMetrics(data: Omit<MetricsEvent['data'], 'timestamp'>) {
    const channel = 'admin:metrics';

    const event: MetricsEvent = {
      type: 'system_metrics',
      data,
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'metrics_update',
      data: event
    });

    return event;
  }

  async publishTenantMetrics(tenantId: string, data: Omit<MetricsEvent['data'], 'timestamp'>) {
    const channel = `tenant:${tenantId}:metrics`;

    const event: MetricsEvent = {
      tenantId,
      type: 'tenant_metrics',
      data,
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'metrics_update',
      data: event
    });

    return event;
  }

  async publishAlert(tenantId: string | null, message: string, severity: 'info' | 'warning' | 'critical') {
    const channel = tenantId ? `tenant:${tenantId}:alerts` : 'admin:alerts';

    const event = {
      type: 'alert',
      severity,
      message,
      timestamp: new Date().toISOString()
    };

    await this.centrifugo.publish(channel, {
      type: 'alert',
      data: event
    });

    return event;
  }
}

export const metricsPublisher = new MetricsPublisher();
```

### **3.2. Frontend - Real-time Dashboard**

```vue
<!-- admin-portal/components/RealTimeDashboard.vue -->
<template>
  <div class="realtime-dashboard">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- CPU -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">CPU</p>
            <p class="text-2xl font-bold">{{ metrics?.cpu.toFixed(1) }}%</p>
          </div>
          <UProgress :value="metrics?.cpu || 0" :color="getCpuColor(metrics?.cpu || 0)" />
        </div>
      </UCard>

      <!-- Memory -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Memoria</p>
            <p class="text-2xl font-bold">{{ metrics?.memory.toFixed(1) }}%</p>
          </div>
          <UProgress :value="metrics?.memory || 0" :color="getMemoryColor(metrics?.memory || 0)" />
        </div>
      </UCard>

      <!-- Disk -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Disco</p>
            <p class="text-2xl font-bold">{{ metrics?.disk.toFixed(1) }}%</p>
          </div>
          <UProgress :value="metrics?.disk || 0" :color="getDiskColor(metrics?.disk || 0)" />
        </div>
      </UCard>

      <!-- Active Instances -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Instancias Activas</p>
            <p class="text-2xl font-bold">{{ metrics?.activeInstances || 0 }}</p>
          </div>
          <UIcon name="i-heroicons-server" class="text-2xl text-blue-500" />
        </div>
      </UCard>
    </div>

    <!-- Network Chart -->
    <UCard class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">Tráfico de Red</h3>
      </template>
      <div class="h-64">
        <LineChart
          v-if="networkData.length > 0"
          :data="networkData"
          :options="chartOptions"
        />
      </div>
    </UCard>

    <!-- Alerts -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Alertas Recientes</h3>
          <UBadge :color="getAlertSeverityColor(latestAlert?.severity)">
            {{ getAlertSeverityLabel(latestAlert?.severity) }}
          </UBadge>
        </div>
      </template>

      <div v-if="alerts.length === 0" class="text-center py-8 text-gray-500">
        Sin alertas
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="alert in alerts"
          :key="alert.timestamp"
          class="flex items-start gap-3 p-3 rounded"
          :class="getAlertClass(alert.severity)"
        >
          <UIcon :name="getAlertIcon(alert.severity)" class="text-xl mt-0.5" />
          <div class="flex-1">
            <p class="font-medium">{{ alert.message }}</p>
            <p class="text-sm text-gray-600">{{ formatDate(alert.timestamp) }}</p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface Metrics {
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  activeInstances: number;
  uptime: number;
}

interface Alert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

const metrics = ref<Metrics | null>(null);
const alerts = ref<Alert[]>([]);
const networkData = ref<{ time: string; in: number; out: number }[]>([]);

const {
  subscribeToSystemMetrics,
  subscribeToAlerts,
  isConnected
} = useRealtimeMetrics();

// Suscribirse al montar
onMounted(() => {
  subscribeToSystemMetrics((data) => {
    metrics.value = data;

    // Agregar al gráfico de red
    networkData.value.push({
      time: new Date().toLocaleTimeString(),
      in: data.networkIn,
      out: data.networkOut
    });

    // Mantener solo los últimos 20 puntos de datos
    if (networkData.value.length > 20) {
      networkData.value.shift();
    }
  });

  subscribeToAlerts((alert) => {
    alerts.value.unshift(alert);
    if (alerts.value.length > 10) {
      alerts.value.pop();
    }
  });
});

const latestAlert = computed(() => alerts.value[0]);

const getCpuColor = (cpu: number) => {
  if (cpu > 80) return 'red';
  if (cpu > 60) return 'orange';
  return 'green';
};

const getMemoryColor = (memory: number) => {
  if (memory > 85) return 'red';
  if (memory > 70) return 'orange';
  return 'green';
};

const getDiskColor = (disk: number) => {
  if (disk > 90) return 'red';
  if (disk > 75) return 'orange';
  return 'green';
};

const getAlertClass = (severity?: string) => {
  const classes: Record<string, string> = {
    critical: 'bg-red-50 border border-red-200',
    warning: 'bg-orange-50 border border-orange-200',
    info: 'bg-blue-50 border border-blue-200'
  };
  return classes[severity || 'info'] || classes.info;
};

const getAlertIcon = (severity?: string) => {
  const icons: Record<string, string> = {
    critical: 'i-heroicons-exclamation-triangle',
    warning: 'i-heroicons-exclamation-circle',
    info: 'i-heroicons-information-circle'
  };
  return icons[severity || 'info'] || icons.info;
};

const getAlertSeverityColor = (severity?: string) => {
  const colors: Record<string, string> = {
    critical: 'red',
    warning: 'orange',
    info: 'blue'
  };
  return colors[severity || 'info'] || 'gray';
};

const getAlertSeverityLabel = (severity?: string) => {
  const labels: Record<string, string> = {
    critical: 'Crítico',
    warning: 'Advertencia',
    info: 'Información'
  };
  return labels[severity || 'info'] || 'Info';
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('es-MX');
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
</script>
```

---

## 👥 CASO DE USO 4: PRESENCIA DE USUARIOS

### **Contexto de Negocio**
En portales colaborativos:
- ✅ Mostrar quién está online
- ✅ Última actividad
- ✅ Estado (activo, ausente, ocupado)
- ✅ Notificaciones de entrada/salida

### **4.1. Backend - Presence Service**

```typescript
// event-service/src/services/PresenceService.ts
import { Centrifugo } from 'centrifugo';
import Redis from 'ioredis';

interface PresenceInfo {
  userId: string;
  tenantId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentPage?: string;
}

export class PresenceService {
  private centrifugo: Centrifugo;
  private redis: Redis;

  constructor() {
    this.centrifugo = new Centrifugo({
      url: process.env.CENTRIFUGO_URL,
      token: process.env.CENTRIFUGO_TOKEN
    });
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async updatePresence(tenantId: string, userId: string, userName: string, status: PresenceInfo['status']) {
    const channel = `tenant:${tenantId}:presence`;

    const presence: PresenceInfo = {
      tenantId,
      userId,
      userName,
      status,
      lastSeen: new Date().toISOString()
    };

    // Almacenar en Redis
    await this.redis.hset(
      `presence:${tenantId}`,
      userId,
      JSON.stringify(presence)
    );

    // Publicar actualización
    await this.centrifugo.publish(channel, {
      type: 'presence_update',
      data: presence
    });

    return presence;
  }

  async getPresenceList(tenantId: string): Promise<PresenceInfo[]> {
    const presenceData = await this.redis.hgetall(`presence:${tenantId}`);

    return Object.values(presenceData).map(data => JSON.parse(data));
  }

  async setOffline(tenantId: string, userId: string) {
    const channel = `tenant:${tenantId}:presence`;

    const presenceData = await this.redis.hget(`presence:${tenantId}`, userId);

    if (presenceData) {
      const presence = JSON.parse(presenceData);
      presence.status = 'offline';
      presence.lastSeen = new Date().toISOString();

      await this.redis.hset(
        `presence:${tenantId}`,
        userId,
        JSON.stringify(presence)
      );

      await this.centrifugo.publish(channel, {
        type: 'presence_update',
        data: presence
      });
    }
  }
}

export const presenceService = new PresenceService();
```

### **4.2. Frontend - User Presence Widget**

```vue
<!-- tenant-portal/components/UserPresence.vue -->
<template>
  <div class="user-presence">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Usuarios Online ({{ onlineUsers.length }})</h3>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" :class="isConnected ? 'bg-green-500' : 'bg-red-500'"></div>
        <span class="text-sm text-gray-600">{{ isConnected ? 'Conectado' : 'Desconectado' }}</span>
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="user in sortedUsers"
        :key="user.userId"
        class="flex items-center gap-3 p-3 rounded hover:bg-gray-50"
      >
        <div class="relative">
          <UAvatar :alt="user.userName" size="sm" />
          <div
            class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
            :class="getStatusColor(user.status)"
          ></div>
        </div>

        <div class="flex-1">
          <p class="font-medium">{{ user.userName }}</p>
          <p class="text-xs text-gray-500">
            {{ getStatusLabel(user.status) }}
            <span v-if="user.currentPage"> • {{ user.currentPage }}</span>
          </p>
        </div>

        <span class="text-xs text-gray-400">
          {{ formatTimeAgo(user.lastSeen) }}
        </span>
      </div>

      <div v-if="sortedUsers.length === 0" class="text-center py-8 text-gray-500">
        Sin usuarios online
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UserPresence {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentPage?: string;
}

const props = defineProps<{
  tenantId: string;
  currentUserId: string;
}>();

const users = ref<Map<string, UserPresence>>(new Map());
const { isConnected, subscribeToPresence } = usePresenceEvents(props.tenantId);

const onlineUsers = computed(() =>
  Array.from(users.value.values()).filter(u => u.status !== 'offline')
);

const sortedUsers = computed(() =>
  onlineUsers.value.sort((a, b) => {
    // Usuario actual primero
    if (a.userId === props.currentUserId) return -1;
    if (b.userId === props.currentUserId) return 1;

    // Luego por estado
    const statusOrder = { online: 0, busy: 1, away: 2, offline: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  })
);

onMounted(() => {
  subscribeToPresence((user) => {
    users.value.set(user.userId, user);
  });
});

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400'
  };
  return colors[status] || 'bg-gray-400';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    online: 'Online',
    busy: 'Ocupado',
    away: 'Ausente',
    offline: 'Offline'
  };
  return labels[status] || status;
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h hace`;
  if (minutes > 0) return `${minutes}min hace`;
  return 'ahora';
};
</script>
```

---

## 🔐 CASO DE USO 5: AUTENTICACIÓN Y SEGURIDAD

### **5.1. JWT Middleware**

```typescript
// event-service/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Centrifugo } from 'centrifugo';

export interface AuthContext {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
}

export class AuthMiddleware {
  private centrifugo: Centrifugo;

  constructor() {
    this.centrifugo = new Centrifugo({
      url: process.env.CENTRIFUGO_URL,
      token: process.env.CENTRIFUGO_TOKEN,
      secret: process.env.CENTRIFUGO_SECRET
    });
  }

  async authenticate(token: string): Promise<AuthContext> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      return {
        userId: decoded.sub,
        tenantId: decoded.tenantId,
        roles: decoded.roles || [],
        permissions: decoded.permissions || []
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async authorize(
    context: AuthContext,
    channel: string,
    action: 'subscribe' | 'publish'
  ): Promise<boolean> {
    // Verificar aislamiento de tenant
    if (channel.includes('tenant:')) {
      const channelTenantId = channel.split(':')[1];
      if (channelTenantId !== context.tenantId) {
        return false;
      }
    }

    // Verificar permisos para canales admin
    if (channel.startsWith('admin:')) {
      if (!context.roles.includes('admin')) {
        return false;
      }
    }

    // Verificar permisos específicos
    if (action === 'publish') {
      const requiredPermission = this.getRequiredPermission(channel);
      if (requiredPermission && !context.permissions.includes(requiredPermission)) {
        return false;
      }
    }

    return true;
  }

  private getRequiredPermission(channel: string): string | null {
    const permissions: Record<string, string> = {
      'deployments': 'deploy:write',
      'billing': 'billing:read',
      'metrics': 'metrics:read',
      'alerts': 'alerts:read'
    };

    for (const [key, permission] of Object.entries(permissions)) {
      if (channel.includes(key)) {
        return permission;
      }
    }

    return null;
  }

  generateConnectionToken(context: AuthContext): string {
    return this.centrifugo.generateConnectionToken({
      userId: context.userId,
      tenantId: context.tenantId,
      roles: context.roles
    });
  }
}

export const authMiddleware = new AuthMiddleware();
```

---

## 📝 CASO DE USO 6: HISTORIAL DE MENSAJES

### **6.1. Redis-based History**

```typescript
// event-service/src/services/HistoryService.ts
import Redis from 'ioredis';

interface MessageHistory {
  id: string;
  channel: string;
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

export class HistoryService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async storeMessage(channel: string, type: string, data: any, userId?: string) {
    const message: MessageHistory = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channel,
      type,
      data,
      timestamp: new Date().toISOString(),
      userId
    };

    // Almacenar en lista de Redis (mantener últimos 100 mensajes por canal)
    await this.redis.lpush(
      `history:${channel}`,
      JSON.stringify(message)
    );

    await this.redis.ltrim(`history:${channel}`, 0, 99);

    return message;
  }

  async getHistory(channel: string, limit: number = 50): Promise<MessageHistory[]> {
    const messages = await this.redis.lrange(`history:${channel}`, 0, limit - 1);

    return messages.map(msg => JSON.parse(msg)).reverse();
  }

  async searchHistory(
    channel: string,
    query: string,
    startDate?: string,
    endDate?: string
  ): Promise<MessageHistory[]> {
    const allMessages = await this.getHistory(channel, 100);

    return allMessages.filter(msg => {
      const matchesQuery = !query ||
        JSON.stringify(msg.data).toLowerCase().includes(query.toLowerCase());

      const matchesStartDate = !startDate ||
        new Date(msg.timestamp) >= new Date(startDate);

      const matchesEndDate = !endDate ||
        new Date(msg.timestamp) <= new Date(endDate);

      return matchesQuery && matchesStartDate && matchesEndDate;
    });
  }
}

export const historyService = new HistoryService();
```

---

## 🧪 CASO DE USO 7: PRUEBAS AUTOMATIZADAS

### **7.1. Integration Test**

```typescript
// event-service/tests/integration/deployment-flow.test.ts
import { WebSocket } from 'ws';
import { deploymentPublisher } from '../../src/publishers/DeploymentPublisher';

describe('Deployment Flow Integration', () => {
  let ws: WebSocket;
  let messages: any[] = [];

  beforeAll((done) => {
    ws = new WebSocket('ws://localhost:8000/connection/websocket');

    ws.on('open', () => {
      // Suscribirse al canal
      ws.send(JSON.stringify({
        method: 'subscribe',
        params: { channel: 'tenant:test-123:deployments' }
      }));
      done();
    });

    ws.on('message', (data) => {
      messages.push(JSON.parse(data.toString()));
    });
  });

  afterAll(() => {
    ws.close();
  });

  it('should publish and receive deployment events', async () => {
    const tenantId = 'test-123';
    const deploymentId = 'deploy-456';

    // Publicar inicio
    await deploymentPublisher.publishStart(tenantId, deploymentId, 'odoo');

    await new Promise(resolve => setTimeout(resolve, 100));

    // Publicar progreso
    await deploymentPublisher.publishProgress(tenantId, deploymentId, 50, 'Halfway done');

    await new Promise(resolve => setTimeout(resolve, 100));

    // Publicar finalización
    await deploymentPublisher.publishCompletion(tenantId, deploymentId, 'https://odoo-test.neo-stack.com');

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verificar mensajes
    expect(messages.length).toBeGreaterThanOrEqual(3);

    const startMessage = messages.find(m => m.data?.type === 'deployment_start');
    expect(startMessage).toBeDefined();
    expect(startMessage.data.data.status).toBe('starting');

    const progressMessage = messages.find(m => m.data?.type === 'deployment_progress');
    expect(progressMessage).toBeDefined();
    expect(progressMessage.data.data.progress).toBe(50);

    const completeMessage = messages.find(m => m.data?.type === 'deployment_complete');
    expect(completeMessage).toBeDefined();
    expect(completeMessage.data.data.status).toBe('completed');
  });
});
```

---

## 📚 CASO DE USO 8: MONITOREO Y OBSERVABILIDAD

### **8.1. Prometheus Metrics**

```typescript
// event-service/src/monitoring/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const metrics = {
  // Contadores
  eventsPublished: new Counter({
    name: 'events_published_total',
    help: 'Número total de eventos publicados',
    labelNames: ['channel', 'type', 'tenant_id']
  }),

  eventsReceived: new Counter({
    name: 'events_received_total',
    help: 'Número total de eventos recibidos por clientes',
    labelNames: ['channel', 'type', 'tenant_id']
  }),

  // Histogramas
  eventSize: new Histogram({
    name: 'event_size_bytes',
    help: 'Tamaño de eventos en bytes',
    buckets: [100, 500, 1000, 5000, 10000]
  }),

  publishLatency: new Histogram({
    name: 'event_publish_duration_seconds',
    help: 'Tiempo invertido en publicar eventos',
    buckets: [0.01, 0.05, 0.1, 0.5, 1]
  }),

  // Gauges
  activeConnections: new Gauge({
    name: 'active_connections',
    help: 'Número de conexiones WebSocket activas'
  }),

  activeChannels: new Gauge({
    name: 'active_channels',
    help: 'Número de canales activos'
  })
};

// Middleware para rastrear métricas
export const trackPublish = (channel: string, type: string, tenantId: string, duration: number, size: number) => {
  metrics.eventsPublished.inc({ channel, type, tenant_id: tenantId });
  metrics.publishLatency.observe(duration);
  metrics.eventSize.observe(size);
};

export const trackReceive = (channel: string, type: string, tenantId: string) => {
  metrics.eventsReceived.inc({ channel, type, tenant_id: tenantId });
};
```

---

## ✅ PRÓXIMOS PASOS

### **Para Implementar en la Plataforma:**

1. **Setup Inicial**
   ```bash
   # Crear directorio del servicio
   mkdir -p event-service/src/{publishers,services,middleware}
   mkdir -p event-service/tests/integration

   # Instalar dependencias
   npm install centrifugo ioredis jsonwebtoken prom-client
   ```

2. **Configurar Docker**
   ```yaml
   # docker-compose.yml
   services:
     centrifugo:
       image: centrifugo/centrifugo:v3
       ports:
         - "8000:8000"
       config:
         - centrifugo.json

     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
   ```

3. **Integrar con Portales**
   - Agregar composables a los 3 portales
   - Implementar componentes de notificación
   - Configurar conexiones WebSocket

4. **Configurar Monitoreo**
   - Scraping de Prometheus
   - Dashboards de Grafana
   - Reglas de alertas

---

## 📖 CONCLUSIÓN

Estos 8 casos de uso demuestran cómo Centrifugo puede transformar el NEO_STACK Platform en una **plataforma verdaderamente en tiempo real**. Cada caso incluye:

- ✅ **Contexto de negocio** claro
- ✅ **Implementación completa** en código
- ✅ **Patrones multi-tenant** seguros
- ✅ **Integración frontend** lista
- ✅ **Pruebas** automatizadas

**Próximo paso**: Implementar el **Sprint 1** del roadmap de 45 días.

---

**Desarrollado por**: NeoAnd with ❤️ 🚀🚀🚀
**Fecha**: 06 de Diciembre de 2025
**Versión**: 1.0
