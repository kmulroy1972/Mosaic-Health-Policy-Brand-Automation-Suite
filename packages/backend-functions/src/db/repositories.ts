import type { Container } from '@azure/cosmos';
import type { InvocationContext } from '@azure/functions';

import { getContainer } from './connection';
import type { AuditLog, TemplateMetadata, UserPreferences } from './models';

/**
 * Repository for audit logs
 */
export class AuditLogRepository {
  private container: Container | null = null;

  async getContainer(context?: InvocationContext): Promise<Container> {
    if (!this.container) {
      this.container = await getContainer('auditLogs', '/tenantId', context);
    }
    return this.container;
  }

  /**
   * Create a new audit log entry
   */
  async create(auditLog: AuditLog, context?: InvocationContext): Promise<AuditLog> {
    const container = await this.getContainer(context);
    const { resource } = await container.items.create(auditLog);
    if (!resource) {
      throw new Error('Failed to create audit log entry');
    }
    return resource as AuditLog;
  }

  /**
   * Query audit logs by filters
   */
  async query(
    query: {
      userId?: string;
      tenantId?: string;
      action?: string;
      resourceType?: string;
      status?: AuditLog['status'];
      startDate?: string;
      endDate?: string;
      limit?: number;
    },
    context?: InvocationContext
  ): Promise<AuditLog[]> {
    const container = await this.getContainer(context);
    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: unknown }> = [];

    if (query.userId) {
      conditions.push('c.userId = @userId');
      parameters.push({ name: '@userId', value: query.userId });
    }

    if (query.tenantId) {
      conditions.push('c.tenantId = @tenantId');
      parameters.push({ name: '@tenantId', value: query.tenantId });
    }

    if (query.action) {
      conditions.push('c.action = @action');
      parameters.push({ name: '@action', value: query.action });
    }

    if (query.resourceType) {
      conditions.push('c.resourceType = @resourceType');
      parameters.push({ name: '@resourceType', value: query.resourceType });
    }

    if (query.status) {
      conditions.push('c.status = @status');
      parameters.push({ name: '@status', value: query.status });
    }

    if (query.startDate) {
      conditions.push('c.timestamp >= @startDate');
      parameters.push({ name: '@startDate', value: query.startDate });
    }

    if (query.endDate) {
      conditions.push('c.timestamp <= @endDate');
      parameters.push({ name: '@endDate', value: query.endDate });
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = query.limit || 100;
    const sqlQuery = `SELECT * FROM c ${whereClause} ORDER BY c.timestamp DESC OFFSET 0 LIMIT ${limit}`;

    const { resources } = await container.items
      .query<AuditLog>({
        query: sqlQuery,
        parameters: parameters.map((p) => ({ name: p.name, value: String(p.value) }))
      })
      .fetchAll();
    return resources;
  }
}

/**
 * Repository for template metadata
 */
export class TemplateRepository {
  private container: Container | null = null;

  async getContainer(context?: InvocationContext): Promise<Container> {
    if (!this.container) {
      this.container = await getContainer('templates', '/tenantId', context);
    }
    return this.container;
  }

  /**
   * Create or update template metadata
   */
  async upsert(template: TemplateMetadata, context?: InvocationContext): Promise<TemplateMetadata> {
    const container = await this.getContainer(context);
    const { resource } = await container.items.upsert(template);
    if (!resource) {
      throw new Error('Failed to upsert template metadata');
    }
    return resource as unknown as TemplateMetadata;
  }

  /**
   * Get template by ID
   */
  async get(
    id: string,
    tenantId?: string,
    context?: InvocationContext
  ): Promise<TemplateMetadata | null> {
    const container = await this.getContainer(context);
    try {
      const { resource } = await container.item(id, tenantId || '').read();
      return resource;
    } catch {
      if (context) {
        context.log(`Template not found: ${id}`);
      }
      return null;
    }
  }

  /**
   * Query templates
   */
  async query(
    query: {
      tenantId?: string;
      category?: string;
      source?: TemplateMetadata['source'];
      tags?: string[];
      limit?: number;
    },
    context?: InvocationContext
  ): Promise<TemplateMetadata[]> {
    const container = await this.getContainer(context);
    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: unknown }> = [];

    if (query.tenantId) {
      conditions.push('c.tenantId = @tenantId');
      parameters.push({ name: '@tenantId', value: query.tenantId });
    }

    if (query.category) {
      conditions.push('c.category = @category');
      parameters.push({ name: '@category', value: query.category });
    }

    if (query.source) {
      conditions.push('c.source = @source');
      parameters.push({ name: '@source', value: query.source });
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = query.limit || 100;
    const sqlQuery = `SELECT * FROM c ${whereClause} ORDER BY c.lastModified DESC OFFSET 0 LIMIT ${limit}`;

    const { resources } = await container.items
      .query<TemplateMetadata>({
        query: sqlQuery,
        parameters: parameters.map((p) => ({ name: p.name, value: String(p.value) }))
      })
      .fetchAll();
    return resources;
  }
}

/**
 * Repository for user preferences
 */
export class UserPreferencesRepository {
  private container: Container | null = null;

  async getContainer(context?: InvocationContext): Promise<Container> {
    if (!this.container) {
      this.container = await getContainer('userPreferences', '/tenantId', context);
    }
    return this.container;
  }

  /**
   * Get user preferences
   */
  async get(
    userId: string,
    tenantId?: string,
    context?: InvocationContext
  ): Promise<UserPreferences | null> {
    const container = await this.getContainer(context);
    try {
      const { resource } = await container.item(userId, tenantId || '').read();
      return resource;
    } catch {
      if (context) {
        context.log(`User preferences not found for user: ${userId}`);
      }
      return null;
    }
  }

  /**
   * Create or update user preferences
   */
  async upsert(
    preferences: UserPreferences,
    context?: InvocationContext
  ): Promise<UserPreferences> {
    const container = await this.getContainer(context);
    const { resource } = await container.items.upsert(preferences);
    if (!resource) {
      throw new Error('Failed to upsert user preferences');
    }
    return resource as unknown as UserPreferences;
  }
}

// Export singleton instances
export const auditLogRepository = new AuditLogRepository();
export const templateRepository = new TemplateRepository();
export const userPreferencesRepository = new UserPreferencesRepository();
