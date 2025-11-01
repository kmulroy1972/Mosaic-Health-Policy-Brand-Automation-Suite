/**
 * Global Configuration Service
 */

import type { InvocationContext } from '@azure/functions';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  tenantIds?: string[]; // If specified, only enabled for these tenants
}

export interface TenantConfig {
  tenantId: string;
  settings: Record<string, unknown>;
  featureFlags: string[]; // Enabled feature flag names
}

export interface ConfigRequest {
  tenantId?: string;
  featureFlags?: FeatureFlag[];
  settings?: Record<string, unknown>;
}

export interface ConfigResponse {
  tenantId?: string;
  featureFlags: FeatureFlag[];
  settings: Record<string, unknown>;
  lastUpdated: string;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    name: 'BRAND_AGENT_V2',
    enabled: false,
    description: 'New BrandGuidanceAgent implementation'
  },
  {
    name: 'SEMANTIC_SEARCH_V2',
    enabled: true,
    description: 'Enhanced semantic search'
  },
  {
    name: 'REALTIME_COMPLIANCE',
    enabled: true,
    description: 'Real-time compliance scanning'
  }
];

export async function getConfig(
  tenantId?: string,
  context?: InvocationContext
): Promise<ConfigResponse> {
  // TODO: Load from Cosmos DB or Azure App Configuration
  // For now, return default configuration

  if (context) {
    context.log('Retrieving configuration', { tenantId });
  }

  return {
    tenantId,
    featureFlags: DEFAULT_FEATURE_FLAGS,
    settings: {
      maxDocumentSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['pdf', 'docx', 'html'],
      defaultLanguage: 'en'
    },
    lastUpdated: new Date().toISOString()
  };
}

export async function updateConfig(
  request: ConfigRequest,
  context: InvocationContext
): Promise<ConfigResponse> {
  // TODO: Save to Cosmos DB or Azure App Configuration
  // For now, return updated configuration

  context.log('Updating configuration', {
    tenantId: request.tenantId,
    featureFlagsCount: request.featureFlags?.length || 0
  });

  return {
    tenantId: request.tenantId,
    featureFlags: request.featureFlags || DEFAULT_FEATURE_FLAGS,
    settings: request.settings || {},
    lastUpdated: new Date().toISOString()
  };
}
