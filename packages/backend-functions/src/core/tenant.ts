/**
 * Multi-tenant routing and storage
 */

import type { HttpRequest } from '@azure/functions';

/**
 * Extract tenant ID from request
 */
export function extractTenantId(request: HttpRequest): string | null {
  // Check X-Mosaic-Tenant header
  const headerTenant =
    request.headers.get('X-Mosaic-Tenant') || request.headers.get('x-mosaic-tenant');
  if (headerTenant) {
    return headerTenant;
  }

  // Check query parameter
  const queryTenant = request.query.get('tenantId') || request.query.get('tenant');
  if (queryTenant) {
    return queryTenant;
  }

  // TODO: Extract from authenticated token
  // const authContext = await authenticateRequest(request, context, { requireAuth: false });
  // return authContext?.context?.tenantId || null;

  return null;
}

/**
 * Create tenant-scoped partition key for Cosmos DB
 */
export function createTenantPartitionKey(tenantId: string | null): string {
  return tenantId || 'default';
}
