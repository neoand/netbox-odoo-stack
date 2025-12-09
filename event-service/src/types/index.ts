// 📘 TIPOS E INTERFACES - EVENT SERVICE
// NEO_STACK Platform v3.0 - Centrifugo Integration

// ============================================
// EVENT TYPES
// ============================================

export interface BaseEvent {
  id: string;
  tenantId?: string;
  userId?: string;
  type: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DeploymentEvent extends BaseEvent {
  type: 'deployment_start' | 'deployment_progress' | 'deployment_complete' | 'deployment_error';
  tenantId: string;
  deploymentId: string;
  instanceType: 'odoo' | 'netbox' | 'wazuh' | 'cortex' | 'misp' | 'thehive';
  status: 'starting' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  logs: string[];
  estimatedCompletion?: string;
}

export interface BillingEvent extends BaseEvent {
  type: 'billing_invoice' | 'billing_payment' | 'billing_usage_alert' | 'billing_plan_change';
  tenantId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount?: number;
  currency?: string;
  invoiceId?: string;
  paymentId?: string;
  planName?: string;
  message: string;
  metadata?: {
    usage?: number;
    limit?: number;
    resource?: string;
    percentage?: number;
  };
}

export interface MetricsEvent extends BaseEvent {
  type: 'metrics_update' | 'metrics_threshold' | 'metrics_anomaly';
  tenantId?: string; // undefined = admin (all tenants)
  data: {
    cpu: number;
    memory: number;
    disk: number;
    networkIn: number;
    networkOut: number;
    activeInstances: number;
    uptime: number;
  };
}

export interface AlertEvent extends BaseEvent {
  type: 'alert_critical' | 'alert_warning' | 'alert_info';
  tenantId?: string; // null/undefined = system-wide
  severity: 'critical' | 'warning' | 'info';
  message: string;
  source: string;
  metadata?: {
    threshold?: number;
    value?: number;
    component?: string;
  };
}

export interface PresenceEvent extends BaseEvent {
  type: 'presence_update' | 'presence_join' | 'presence_leave';
  tenantId: string;
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentPage?: string;
}

export interface NotificationEvent extends BaseEvent {
  type: 'notification' | 'announcement' | 'maintenance';
  tenantId?: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'billing' | 'security' | 'feature';
  read: boolean;
  actions?: Array<{
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
}

// ============================================
// AUTH & SECURITY
// ============================================

export interface AuthContext {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  tokenType: 'access' | 'refresh';
  issuedAt: number;
  expiresAt: number;
}

export interface JWTPayload {
  sub: string; // user ID
  tenantId: string;
  roles: string[];
  permissions: string[];
  iat: number; // issued at
  exp: number; // expires at
  aud?: string; // audience
  iss?: string; // issuer
}

export interface ChannelPermission {
  channelPattern: string;
  actions: ('subscribe' | 'publish')[];
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

// ============================================
// CHANNEL STRUCTURE
// ============================================

export interface ChannelConfig {
  name: string;
  pattern: string;
  isTenantSpecific: boolean;
  isAdminOnly: boolean;
  isSystemWide: boolean;
  permissions: ChannelPermission[];
}

export const CHANNEL_PATTERNS = {
  // Tenant-specific channels
  TENANT_DEPLOYMENTS: 'tenant:{tenantId}:deployments',
  TENANT_BILLING: 'tenant:{tenantId}:billing',
  TENANT_METRICS: 'tenant:{tenantId}:metrics',
  TENANT_ALERTS: 'tenant:{tenantId}:alerts',
  TENANT_PRESENCE: 'tenant:{tenantId}:presence',
  TENANT_NOTIFICATIONS: 'tenant:{tenantId}:notifications',
  TENANT_EXAMS: 'tenant:{tenantId}:exams',
  TENANT_PROCTORING: 'tenant:{tenantId}:proctoring',
  TENANT_RESULTS: 'tenant:{tenantId}:results',

  // Admin channels (global)
  ADMIN_METRICS: 'admin:metrics',
  ADMIN_ALERTS: 'admin:alerts',
  ADMIN_TENANTS: 'admin:tenants',
  ADMIN_SYSTEM: 'admin:system',

  // System-wide channels
  SYSTEM_HEALTH: 'system:health',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_ANNOUNCEMENTS: 'system:announcements',

  // User-specific channels
  USER_NOTIFICATIONS: 'user:{userId}:notifications',
} as const;

// ============================================
// PUBLISHER INTERFACES
// ============================================

export interface BasePublisherConfig {
  name: string;
  enabled: boolean;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  batchTimeout: number;
}

export interface PublisherMetrics {
  eventsPublished: number;
  eventsFailed: number;
  averageLatency: number;
  lastPublishAt?: string;
}

// ============================================
// REDIS CONFIGURATION
// ============================================

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  ttl: {
    presence: number;
    history: number;
    rateLimit: number;
  };
  maxConnections: number;
  retryAttempts: number;
  retryDelay: number;
}

// ============================================
// CENTRIFUGO CONFIGURATION
// ============================================

export interface CentrifugoConfig {
  address: string;
  port: number;
  secret: string;
  token: string;
  healthCheckPath: string;
  websocketPath: string;
  connectionLimit: number;
  messageLimit: number;
  clientRequestLimit: number;
  historySize: number;
  historyTTL: number;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface PublishResponse {
  success: boolean;
  messageId?: string;
  channel?: string;
  error?: string;
  timestamp: string;
}

export interface SubscribeResponse {
  success: boolean;
  channel: string;
  history?: any[];
  error?: string;
  timestamp: string;
}

// ============================================
// ERROR TYPES
// ============================================

export enum EventErrorCode {
  INVALID_TOKEN = 'INVALID_TOKEN',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CHANNEL_NOT_FOUND = 'CHANNEL_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PUBLISH_FAILED = 'PUBLISH_FAILED',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class EventError extends Error {
  constructor(
    public code: EventErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'EventError';
  }
}

// ============================================
// UTILITY TYPES
// ============================================

export type EventType =
  | DeploymentEvent
  | BillingEvent
  | MetricsEvent
  | AlertEvent
  | PresenceEvent
  | NotificationEvent;

export type ChannelType =
  | typeof CHANNEL_PATTERNS.TENANT_DEPLOYMENTS
  | typeof CHANNEL_PATTERNS.TENANT_BILLING
  | typeof CHANNEL_PATTERNS.TENANT_METRICS
  | typeof CHANNEL_PATTERNS.TENANT_ALERTS
  | typeof CHANNEL_PATTERNS.TENANT_PRESENCE
  | typeof CHANNEL_PATTERNS.ADMIN_METRICS
  | typeof CHANNEL_PATTERNS.ADMIN_ALERTS
  | typeof CHANNEL_PATTERNS.SYSTEM_HEALTH;

export type PublisherType =
  | 'deployment'
  | 'billing'
  | 'metrics'
  | 'alert'
  | 'presence'
  | 'notification';

// ============================================
// EXPORT ALL
// ============================================

export * from './events';
