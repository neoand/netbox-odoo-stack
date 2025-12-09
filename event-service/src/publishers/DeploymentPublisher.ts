// 🚀 DEPLOYMENT PUBLISHER
// Real-time deployment status updates
// NEO_STACK Platform v3.0

import { EventEmitter } from 'events';
import { Centrifugo, CentrifugoClient } from 'centrifugo';
import { DeploymentEvent, CHANNEL_PATTERNS } from '../types';
import { trackPublish } from '../monitoring/metrics';

export interface OdooConfig {
  version: string;
  modules: string[];
  database: string;
  adminUser: string;
}

export interface NetBoxConfig {
  version: string;
  plugins: string[];
  database: string;
}

export interface WazuhConfig {
  managerVersion: string;
  agents: number;
  indexer: boolean;
  dashboard: boolean;
}

/**
 * Publisher for deployment-related events
 * Handles all deployment status updates in real-time
 */
export class DeploymentPublisher extends EventEmitter {
  private centrifugo: CentrifugoClient;
  private isInitialized: boolean = false;

  constructor() {
    super();

    // Initialize Centrifugo client
    this.centrifugo = new CentrifugoClient({
      url: process.env.CENTRIFUGO_URL || 'http://localhost:8000',
      token: process.env.CENTRIFUGO_TOKEN || 'your-token-key',
    });

    this.initialize();
  }

  /**
   * Initialize the Centrifugo client
   */
  private async initialize(): Promise<void> {
    try {
      // Connect to Centrifugo
      await this.centrifugo.connect();
      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ DeploymentPublisher initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize DeploymentPublisher:', error);
      this.emit('error', error);
    }
  }

  /**
   * Ensure publisher is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('DeploymentPublisher not initialized');
    }
  }

  /**
   * Get channel name for tenant deployment events
   */
  private getChannel(tenantId: string): string {
    return CHANNEL_PATTERNS.TENANT_DEPLOYMENTS.replace('{tenantId}', tenantId);
  }

  /**
   * Generate unique deployment ID
   */
  private generateDeploymentId(instanceType: string): string {
    return `${instanceType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Publish deployment start event
   */
  async publishStart(
    tenantId: string,
    instanceType: 'odoo' | 'netbox' | 'wazuh',
    config: OdooConfig | NetBoxConfig | WazuhConfig
  ): Promise<DeploymentEvent> {
    this.ensureInitialized();

    const deploymentId = this.generateDeploymentId(instanceType);
    const channel = this.getChannel(tenantId);

    const event: DeploymentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type: 'deployment_start',
      deploymentId,
      instanceType,
      status: 'starting',
      progress: 0,
      currentStep: 'Iniciando deployment...',
      logs: [
        `[${new Date().toISOString()}] Deployment iniciado`,
        `[${new Date().toISOString()}] Tipo: ${instanceType}`,
        `[${new Date().toISOString()}] Tenant: ${tenantId}`,
      ],
      timestamp: new Date().toISOString(),
    };

    try {
      const startTime = Date.now();
      await this.centrifugo.publish(channel, {
        type: 'deployment_start',
        data: event,
      });
      const duration = (Date.now() - startTime) / 1000;

      // Track metrics
      trackPublish(channel, 'deployment_start', tenantId, duration, JSON.stringify(event).length);

      this.emit('start', event);
      return event;
    } catch (error) {
      console.error('Failed to publish deployment start:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Publish deployment progress event
   */
  async publishProgress(
    tenantId: string,
    deploymentId: string,
    progress: number,
    currentStep: string,
    log?: string
  ): Promise<DeploymentEvent> {
    this.ensureInitialized();

    const channel = this.getChannel(tenantId);

    const event: DeploymentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type: 'deployment_progress',
      deploymentId,
      instanceType: 'odoo', // Will be inferred from deploymentId
      status: 'in_progress',
      progress,
      currentStep,
      logs: log ? [`[${new Date().toISOString()}] ${log}`] : [],
      timestamp: new Date().toISOString(),
    };

    try {
      const startTime = Date.now();
      await this.centrifugo.publish(channel, {
        type: 'deployment_progress',
        data: event,
      });
      const duration = (Date.now() - startTime) / 1000;

      trackPublish(channel, 'deployment_progress', tenantId, duration, JSON.stringify(event).length);

      this.emit('progress', event);
      return event;
    } catch (error) {
      console.error('Failed to publish deployment progress:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Publish deployment completion event
   */
  async publishCompletion(
    tenantId: string,
    deploymentId: string,
    instanceType: 'odoo' | 'netbox' | 'wazuh',
    instanceUrl: string,
    credentials?: {
      adminUser?: string;
      adminPassword?: string;
      apiKey?: string;
    }
  ): Promise<DeploymentEvent> {
    this.ensureInitialized();

    const channel = this.getChannel(tenantId);

    const event: DeploymentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type: 'deployment_complete',
      deploymentId,
      instanceType,
      status: 'completed',
      progress: 100,
      currentStep: 'Deployment concluído com sucesso!',
      logs: [
        `[${new Date().toISOString()}] ✅ Deployment concluído`,
        `[${new Date().toISOString()}] URL: ${instanceUrl}`,
        credentials?.adminUser ? `[${new Date().toISOString()}] Admin: ${credentials.adminUser}` : '',
        credentials?.apiKey ? `[${new Date().toISOString()}] API Key: ${credentials.apiKey}` : '',
      ].filter(Boolean),
      timestamp: new Date().toISOString(),
      metadata: {
        instanceUrl,
        credentials: credentials ? Object.keys(credentials) : [],
      },
    };

    try {
      const startTime = Date.now();
      await this.centrifugo.publish(channel, {
        type: 'deployment_complete',
        data: event,
      });
      const duration = (Date.now() - startTime) / 1000;

      trackPublish(channel, 'deployment_complete', tenantId, duration, JSON.stringify(event).length);

      this.emit('complete', event);
      return event;
    } catch (error) {
      console.error('Failed to publish deployment completion:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Publish deployment error event
   */
  async publishError(
    tenantId: string,
    deploymentId: string,
    error: string,
    instanceType: 'odoo' | 'netbox' | 'wazuh' = 'odoo'
  ): Promise<DeploymentEvent> {
    this.ensureInitialized();

    const channel = this.getChannel(tenantId);

    const event: DeploymentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type: 'deployment_error',
      deploymentId,
      instanceType,
      status: 'failed',
      progress: 0,
      currentStep: 'Erro no deployment',
      logs: [
        `[${new Date().toISOString()}] ❌ Deployment falhou`,
        `[${new Date().toISOString()}] Erro: ${error}`,
        `[${new Date().toISOString()}] Timestamp: ${new Date().toISOString()}`,
      ],
      timestamp: new Date().toISOString(),
      metadata: {
        error,
        errorStack: new Error().stack,
      },
    };

    try {
      const startTime = Date.now();
      await this.centrifugo.publish(channel, {
        type: 'deployment_error',
        data: event,
      });
      const duration = (Date.now() - startTime) / 1000;

      trackPublish(channel, 'deployment_error', tenantId, duration, JSON.stringify(event).length);

      this.emit('error', event);
      return event;
    } catch (publishError) {
      console.error('Failed to publish deployment error:', publishError);
      this.emit('error', publishError);
      throw publishError;
    }
  }

  /**
   * Get deployment status
   * Note: This would typically query a database
   * For now, returns mock data
   */
  async getDeploymentStatus(tenantId: string, deploymentId: string): Promise<DeploymentEvent | null> {
    // In production, this would query your deployment database
    // For now, return null as we're using Redis pub/sub
    return null;
  }

  /**
   * List deployments for a tenant
   * Note: This would typically query a database
   */
  async listDeployments(tenantId: string, limit: number = 50): Promise<DeploymentEvent[]> {
    // In production, this would query your deployment database
    return [];
  }

  /**
   * Close the publisher and cleanup
   */
  async close(): Promise<void> {
    this.ensureInitialized();

    try {
      await this.centrifugo.close();
      this.isInitialized = false;
      this.emit('closed');
      console.log('🔌 DeploymentPublisher closed');
    } catch (error) {
      console.error('Error closing DeploymentPublisher:', error);
      this.emit('error', error);
      throw error;
    }
  }
}

// Export singleton instance
export const deploymentPublisher = new DeploymentPublisher();

// Export for testing
export { DeploymentPublisher };
