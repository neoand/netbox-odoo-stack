// 📊 PROMETHEUS METRICS
// Event system monitoring and observability
// NEO_STACK Platform v3.0

import client, { Counter, Histogram, Gauge, Registry } from 'prom-client';

// Create a custom registry
const register = new Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// ============================================
// COUNTER METRICS
// ============================================

/**
 * Total number of events published
 */
export const eventsPublished = new Counter({
  name: 'events_published_total',
  help: 'Total number of events published',
  labelNames: ['channel', 'type', 'tenant_id', 'status'] as const,
  registers: [register],
});

/**
 * Total number of events received by clients
 */
export const eventsReceived = new Counter({
  name: 'events_received_total',
  help: 'Total number of events received by clients',
  labelNames: ['channel', 'type', 'tenant_id'] as const,
  registers: [register],
});

/**
 * Total number of connection attempts
 */
export const connectionAttempts = new Counter({
  name: 'connection_attempts_total',
  help: 'Total number of WebSocket connection attempts',
  labelNames: ['status'] as const,
  registers: [register],
});

/**
 * Total number of channel subscriptions
 */
export const channelSubscriptions = new Counter({
  name: 'channel_subscriptions_total',
  help: 'Total number of channel subscriptions',
  labelNames: ['channel', 'tenant_id', 'status'] as const,
  registers: [register],
});

/**
 * Total number of authentication failures
 */
export const authFailures = new Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['reason'] as const,
  registers: [register],
});

/**
 * Total number of authorization failures
 */
export const authzFailures = new Counter({
  name: 'authz_failures_total',
  help: 'Total number of authorization failures',
  labelNames: ['channel', 'reason'] as const,
  registers: [register],
});

// ============================================
// HISTOGRAM METRICS
// ============================================

/**
 * Time spent publishing events
 */
export const publishLatency = new Histogram({
  name: 'event_publish_duration_seconds',
  help: 'Time spent publishing events in seconds',
  labelNames: ['channel', 'type', 'tenant_id'] as const,
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * Time spent processing authentication
 */
export const authLatency = new Histogram({
  name: 'auth_duration_seconds',
  help: 'Time spent authenticating in seconds',
  labelNames: ['status'] as const,
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

/**
 * Time spent processing authorization
 */
export const authzLatency = new Histogram({
  name: 'authz_duration_seconds',
  help: 'Time spent authorizing in seconds',
  labelNames: ['channel', 'action'] as const,
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

/**
 * Time spent establishing WebSocket connections
 */
export const connectionLatency = new Histogram({
  name: 'connection_duration_seconds',
  help: 'Time spent establishing WebSocket connections in seconds',
  labelNames: ['status'] as const,
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * Size of events in bytes
 */
export const eventSize = new Histogram({
  name: 'event_size_bytes',
  help: 'Size of events in bytes',
  labelNames: ['type'] as const,
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000],
  registers: [register],
});

// ============================================
// GAUGE METRICS
// ============================================

/**
 * Number of active WebSocket connections
 */
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active WebSocket connections',
  labelNames: ['tenant_id'] as const,
  registers: [register],
});

/**
 * Number of active channels
 */
export const activeChannels = new Gauge({
  name: 'active_channels',
  help: 'Number of active channels',
  labelNames: ['channel'] as const,
  registers: [register],
});

/**
 * Number of subscribers per channel
 */
export const channelSubscribers = new Gauge({
  name: 'channel_subscribers',
  help: 'Number of subscribers per channel',
  labelNames: ['channel'] as const,
  registers: [register],
});

/**
 * Memory usage of the event service
 */
export const memoryUsage = new Gauge({
  name: 'event_service_memory_bytes',
  help: 'Memory usage of the event service in bytes',
  labelNames: ['type'] as const, // heap, rss, external
  registers: [register],
});

/**
 * CPU usage of the event service
 */
export const cpuUsage = new Gauge({
  name: 'event_service_cpu_percent',
  help: 'CPU usage of the event service in percent',
  registers: [register],
});

/**
 * Number of tenants with active connections
 */
export const activeTenants = new Gauge({
  name: 'active_tenants',
  help: 'Number of tenants with active connections',
  registers: [register],
});

// ============================================
// TRACKING FUNCTIONS
// ============================================

/**
 * Track event publish
 */
export function trackPublish(
  channel: string,
  type: string,
  tenantId: string,
  durationSeconds: number,
  sizeBytes: number,
  status: 'success' | 'error' = 'success'
): void {
  eventsPublished.inc({ channel, type, tenant_id: tenantId, status });
  publishLatency.observe({ channel, type, tenant_id: tenantId }, durationSeconds);
  eventSize.observe({ type }, sizeBytes);
}

/**
 * Track event receive
 */
export function trackReceive(
  channel: string,
  type: string,
  tenantId: string
): void {
  eventsReceived.inc({ channel, type, tenant_id: tenantId });
}

/**
 * Track connection attempt
 */
export function trackConnectionAttempt(status: 'success' | 'failure'): void {
  connectionAttempts.inc({ status });
}

/**
 * Track connection establishment time
 */
export function trackConnection(durationSeconds: number, status: 'success' | 'failure'): void {
  connectionLatency.observe({ status }, durationSeconds);

  if (status === 'success') {
    activeConnections.inc(); // Increment on successful connection
  }
}

/**
 * Track channel subscription
 */
export function trackChannelSubscription(
  channel: string,
  tenantId: string,
  status: 'success' | 'failure'
): void {
  channelSubscriptions.inc({ channel, tenant_id: tenantId, status });

  if (status === 'success') {
    activeChannels.inc({ channel });
  }
}

/**
 * Track authentication
 */
export function trackAuth(durationSeconds: number, success: boolean): void {
  authLatency.observe({ status: success ? 'success' : 'failure' }, durationSeconds);

  if (!success) {
    authFailures.inc({ reason: 'invalid_token' });
  }
}

/**
 * Track authorization
 */
export function trackAuthz(
  durationSeconds: number,
  channel: string,
  action: 'subscribe' | 'publish',
  success: boolean
): void {
  authzLatency.observe({ channel, action }, durationSeconds);

  if (!success) {
    authzFailures.inc({ channel, reason: 'unauthorized' });
  }
}

/**
 * Track active connections by tenant
 */
export function updateActiveConnections(tenantId: string, delta: number): void {
  activeConnections.inc({ tenant_id: tenantId }, delta);
}

/**
 * Track channel subscribers
 */
export function updateChannelSubscribers(channel: string, delta: number): void {
  channelSubscribers.inc({ channel }, delta);
}

/**
 * Track active tenants
 */
export function updateActiveTenants(delta: number): void {
  activeTenants.inc(delta);
}

/**
 * Update memory usage metrics
 */
export function updateMemoryUsage(): void {
  const memUsage = process.memoryUsage();
  memoryUsage.inc({ type: 'heap' }, memUsage.heapUsed);
  memoryUsage.inc({ type: 'rss' }, memUsage.rss);
  memoryUsage.inc({ type: 'external' }, memUsage.external);
}

/**
 * Update CPU usage metric
 */
export function updateCpuUsage(): void {
  // Note: Getting CPU percentage requires more complex tracking
  // This is a placeholder implementation
  cpuUsage.inc(Math.random() * 10); // Mock data for now
}

// ============================================
// HEALTH CHECKS
// ============================================

/**
 * Check if metrics are being collected
 */
export function isMetricsHealthy(): boolean {
  try {
    // Check if registry is working
    const metrics = register.metrics();
    return metrics.length > 0;
  } catch (error) {
    console.error('Metrics health check failed:', error);
    return false;
  }
}

/**
 * Get metrics summary
 */
export function getMetricsSummary() {
  return {
    eventsPublished: eventsPublished.hash,
    eventsReceived: eventsReceived.hash,
    activeConnections: activeConnections.value,
    activeChannels: activeChannels.value,
    activeTenants: activeTenants.value,
    memoryUsage: {
      heap: memoryUsage.hash,
      rss: memoryUsage.hash,
    },
  };
}

// ============================================
// EXPORT FOR GRAFANA
// ============================================

/**
 * Export metrics for Prometheus scraping
 */
export async function exportMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Get registry for custom metrics
 */
export function getRegistry(): Registry {
  return register;
}

// ============================================
// ALERT RULES (for Grafana/Prometheus)
// ============================================

export const alertRules = {
  highLatency: {
    expr: 'histogram_quantile(0.95, event_publish_duration_seconds) > 0.5',
    for: '2m',
    labels: { severity: 'warning' },
    annotations: {
      summary: 'High event publish latency',
      description: '95th percentile latency is above 500ms',
    },
  },

  highConnectionFailures: {
    expr: 'rate(connection_attempts_total{status="failure"}[5m]) > 0.1',
    for: '1m',
    labels: { severity: 'critical' },
    annotations: {
      summary: 'High WebSocket connection failure rate',
      description: 'Connection failure rate is above 10%',
    },
  },

  manyAuthFailures: {
    expr: 'rate(auth_failures_total[5m]) > 0.05',
    for: '2m',
    labels: { severity: 'warning' },
    annotations: {
      summary: 'High authentication failure rate',
      description: 'Authentication failure rate is above 5%',
    },
  },

  memoryUsageHigh: {
    expr: 'event_service_memory_bytes{type="heap"} > 1073741824', // 1GB
    for: '5m',
    labels: { severity: 'warning' },
    annotations: {
      summary: 'High memory usage',
      description: 'Heap memory usage is above 1GB',
    },
  },

  noActiveConnections: {
    expr: 'active_connections == 0',
    for: '10m',
    labels: { severity: 'info' },
    annotations: {
      summary: 'No active connections',
      description: 'No active WebSocket connections for 10 minutes',
    },
  },
};

// ============================================
// DEFAULT EXPORT
// ============================================

export const metrics = {
  counters: {
    eventsPublished,
    eventsReceived,
    connectionAttempts,
    channelSubscriptions,
    authFailures,
    authzFailures,
  },
  histograms: {
    publishLatency,
    authLatency,
    authzLatency,
    connectionLatency,
    eventSize,
  },
  gauges: {
    activeConnections,
    activeChannels,
    channelSubscribers,
    memoryUsage,
    cpuUsage,
    activeTenants,
  },
  tracking: {
    trackPublish,
    trackReceive,
    trackConnection,
    trackChannelSubscription,
    trackAuth,
    trackAuthz,
  },
};

export default metrics;
