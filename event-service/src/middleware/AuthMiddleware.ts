// 🔐 AUTH MIDDLEWARE
// JWT authentication and tenant isolation
// NEO_STACK Platform v3.0

import jwt from 'jsonwebtoken';
import { CentrifugoClient } from 'centrifugo';
import { AuthContext, JWTPayload, EventError, EventErrorCode, CHANNEL_PATTERNS } from '../types';

export interface MiddlewareConfig {
  jwtSecret: string;
  jwtExpiry: number;
  centrifugoSecret: string;
  enableRateLimit: boolean;
  rateLimitWindow: number; // in seconds
  rateLimitMaxRequests: number;
}

/**
 * Authentication and authorization middleware
 * Handles JWT validation, tenant isolation, and RBAC
 */
export class AuthMiddleware {
  private config: MiddlewareConfig;
  private centrifugo: CentrifugoClient;

  constructor(config: MiddlewareConfig) {
    this.config = config;
    this.centrifugo = new CentrifugoClient({
      url: process.env.CENTRIFUGO_URL || 'http://localhost:8000',
      secret: config.centrifugoSecret,
    });
  }

  /**
   * Authenticate JWT token and extract context
   */
  async authenticate(token: string): Promise<AuthContext> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, this.config.jwtSecret) as JWTPayload;

      // Validate required fields
      if (!decoded.sub || !decoded.tenantId) {
        throw new EventError(
          EventErrorCode.INVALID_TOKEN,
          'Token missing required fields (sub or tenantId)'
        );
      }

      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        throw new EventError(EventErrorCode.INVALID_TOKEN, 'Token expired');
      }

      // Build auth context
      const context: AuthContext = {
        userId: decoded.sub,
        tenantId: decoded.tenantId,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        tokenType: 'access', // Assume access token for now
        issuedAt: decoded.iat,
        expiresAt: decoded.exp,
      };

      return context;
    } catch (error) {
      if (error instanceof EventError) {
        throw error;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new EventError(EventErrorCode.INVALID_TOKEN, `Invalid token: ${error.message}`);
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new EventError(EventErrorCode.INVALID_TOKEN, 'Token expired');
      }

      throw new EventError(EventErrorCode.INVALID_TOKEN, 'Authentication failed');
    }
  }

  /**
   * Authorize user access to channel
   */
  async authorize(
    context: AuthContext,
    channel: string,
    action: 'subscribe' | 'publish'
  ): Promise<boolean> {
    try {
      // 1. Check tenant isolation for tenant-specific channels
      if (this.isTenantChannel(channel)) {
        const channelTenantId = this.extractTenantId(channel);

        if (!channelTenantId) {
          throw new EventError(
            EventErrorCode.VALIDATION_ERROR,
            'Invalid tenant channel format'
          );
        }

        if (channelTenantId !== context.tenantId) {
          console.warn(
            `Tenant mismatch: user ${context.userId} from tenant ${context.tenantId} ` +
            `trying to access channel for tenant ${channelTenantId}`
          );
          return false;
        }
      }

      // 2. Check admin-only channels
      if (this.isAdminChannel(channel)) {
        if (!context.roles.includes('admin') && !context.roles.includes('super_admin')) {
          console.warn(
            `Unauthorized admin access attempt by user ${context.userId} (roles: ${context.roles.join(', ')})`
          );
          return false;
        }
      }

      // 3. Check system-wide channels (read-only for most users)
      if (this.isSystemChannel(channel) && action === 'publish') {
        if (!context.roles.includes('admin') && !context.roles.includes('system')) {
          console.warn(
            `Unauthorized system publish attempt by user ${context.userId}`
          );
          return false;
        }
      }

      // 4. Check specific permissions for publish action
      if (action === 'publish') {
        const requiredPermission = this.getRequiredPermission(channel);
        if (requiredPermission && !context.permissions.includes(requiredPermission)) {
          console.warn(
            `Permission denied: user ${context.userId} lacks permission ${requiredPermission}`
          );
          return false;
        }
      }

      // 5. Rate limiting check
      if (this.config.enableRateLimit) {
        const allowed = await this.checkRateLimit(context, channel, action);
        if (!allowed) {
          throw new EventError(
            EventErrorCode.RATE_LIMIT_EXCEEDED,
            'Rate limit exceeded'
          );
        }
      }

      return true;
    } catch (error) {
      if (error instanceof EventError) {
        throw error;
      }

      throw new EventError(
        EventErrorCode.VALIDATION_ERROR,
        `Authorization error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if channel is tenant-specific
   */
  private isTenantChannel(channel: string): boolean {
    return channel.startsWith('tenant:') || channel.startsWith('user:');
  }

  /**
   * Check if channel is admin-only
   */
  private isAdminChannel(channel: string): boolean {
    return channel.startsWith('admin:');
  }

  /**
   * Check if channel is system-wide
   */
  private isSystemChannel(channel: string): boolean {
    return channel.startsWith('system:');
  }

  /**
   * Extract tenant ID from channel
   */
  private extractTenantId(channel: string): string | null {
    const parts = channel.split(':');
    if (parts.length >= 2 && parts[0] === 'tenant') {
      return parts[1];
    }
    return null;
  }

  /**
   * Get required permission for channel
   */
  private getRequiredPermission(channel: string): string | null {
    const permissionMap: Record<string, string> = {
      'deployments': 'deploy:write',
      'billing': 'billing:read',
      'metrics': 'metrics:read',
      'alerts': 'alerts:read',
      'presence': 'presence:read',
      'notifications': 'notifications:read',
      'exams': 'exams:read',
    };

    for (const [resource, permission] of Object.entries(permissionMap)) {
      if (channel.includes(resource)) {
        return permission;
      }
    }

    return null;
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(
    context: AuthContext,
    channel: string,
    action: 'subscribe' | 'publish'
  ): Promise<boolean> {
    // In production, this would use Redis
    // For now, always allow
    // Example implementation:
    /*
    const key = `ratelimit:${context.tenantId}:${context.userId}:${action}`;
    const count = await redis.incr(key);
    await redis.expire(key, this.config.rateLimitWindow);
    return count <= this.config.rateLimitMaxRequests;
    */

    return true;
  }

  /**
   * Generate Centrifugo connection token
   */
  generateConnectionToken(context: AuthContext): string {
    const payload = {
      user: context.userId,
      tenant_id: context.tenantId,
      roles: context.roles,
      exp: Math.floor(Date.now() / 1000) + (this.config.jwtExpiry || 3600),
    };

    // Note: In production, you might want to use Centrifugo's own token generation
    return jwt.sign(payload, this.config.centrifugoSecret);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; authContext: AuthContext }> {
    try {
      // Verify refresh token (typically has longer expiry)
      const decoded = jwt.verify(refreshToken, this.config.jwtSecret) as JWTPayload & { type: 'refresh' };

      if (decoded.type !== 'refresh') {
        throw new EventError(EventErrorCode.INVALID_TOKEN, 'Invalid refresh token type');
      }

      // Build new auth context
      const authContext: AuthContext = {
        userId: decoded.sub,
        tenantId: decoded.tenantId,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        tokenType: 'access',
        issuedAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + (this.config.jwtExpiry || 3600),
      };

      // Generate new access token
      const accessToken = jwt.sign(
        {
          sub: authContext.userId,
          tenantId: authContext.tenantId,
          roles: authContext.roles,
          permissions: authContext.permissions,
          type: 'access',
        },
        this.config.jwtSecret,
        { expiresIn: this.config.jwtExpiry || 3600 }
      );

      return { accessToken, authContext };
    } catch (error) {
      if (error instanceof EventError) {
        throw error;
      }

      throw new EventError(EventErrorCode.INVALID_TOKEN, 'Token refresh failed');
    }
  }

  /**
   * Validate channel subscription
   */
  async validateSubscription(
    context: AuthContext,
    channels: string[]
  ): Promise<{ allowed: string[]; denied: string[] }> {
    const allowed: string[] = [];
    const denied: string[] = [];

    for (const channel of channels) {
      const authorized = await this.authorize(context, channel, 'subscribe');
      if (authorized) {
        allowed.push(channel);
      } else {
        denied.push(channel);
      }
    }

    return { allowed, denied };
  }

  /**
   * Get user permissions summary
   */
  getPermissionSummary(context: AuthContext): {
    roles: string[];
    permissions: string[];
    isAdmin: boolean;
    isSuperAdmin: boolean;
  } {
    return {
      roles: context.roles,
      permissions: context.permissions,
      isAdmin: context.roles.includes('admin'),
      isSuperAdmin: context.roles.includes('super_admin'),
    };
  }
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware({
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
  jwtExpiry: parseInt(process.env.JWT_EXPIRY || '3600'),
  centrifugoSecret: process.env.CENTRIFUGO_SECRET || 'your-centrifugo-secret',
  enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60'),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
});

// Export for testing
export { AuthMiddleware };
