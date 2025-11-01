import { Container } from '@azure/cosmos';
import type { InvocationContext } from '@azure/functions';

import { getContainer } from '../db/connection';

import { PolicyBrief } from './models';

export class BriefRepository {
  private containerName = 'briefs';

  private async getContainer(_context?: InvocationContext): Promise<Container> {
    return getContainer(this.containerName);
  }

  async create(brief: PolicyBrief, context?: InvocationContext): Promise<PolicyBrief> {
    const container = await this.getContainer(context);
    const { resource } = await container.items.create(brief);
    if (!resource) {
      throw new Error('Failed to create policy brief');
    }
    return resource as unknown as PolicyBrief;
  }

  async get(
    id: string,
    tenantId?: string,
    context?: InvocationContext
  ): Promise<PolicyBrief | null> {
    const container = await this.getContainer(context);
    try {
      const partitionKey = tenantId || id;
      const { resource } = await container.item(id, partitionKey).read<PolicyBrief>();
      return resource || null;
    } catch {
      return null;
    }
  }

  async update(brief: PolicyBrief, context?: InvocationContext): Promise<PolicyBrief> {
    const container = await this.getContainer(context);
    const { resource } = await container.items.upsert(brief);
    if (!resource) {
      throw new Error('Failed to update policy brief');
    }
    return resource as unknown as PolicyBrief;
  }

  async query(
    status?: string,
    tenantId?: string,
    limit = 50,
    context?: InvocationContext
  ): Promise<PolicyBrief[]> {
    const container = await this.getContainer(context);
    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: string | number }> = [];

    if (status) {
      conditions.push('c.status = @status');
      parameters.push({ name: '@status', value: status });
    }

    if (tenantId) {
      conditions.push('c.tenantId = @tenantId');
      parameters.push({ name: '@tenantId', value: tenantId });
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sqlQuery = `SELECT * FROM c ${whereClause} ORDER BY c.lastModified DESC OFFSET 0 LIMIT ${limit}`;

    const { resources } = await container.items
      .query<PolicyBrief>({
        query: sqlQuery,
        parameters: parameters.map((p) => ({ name: p.name, value: String(p.value) }))
      })
      .fetchAll();
    return resources;
  }
}

export const briefRepository = new BriefRepository();
