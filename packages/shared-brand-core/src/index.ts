export * from './ai';
export * from './aiClient';
export * from './graphClient';
export * from './telemetry';

export type FeatureFlagSnapshot = {
  enablePdfA: boolean;
  allowNonAzureAI: boolean;
};

export interface TelemetryEnvelope {
  eventName: string;
  tenantHash: string;
  userHash: string;
  host: 'word' | 'powerpoint' | 'outlook' | 'backend';
  elapsedMs: number;
  result: 'success' | 'failure';
  featureFlags: FeatureFlagSnapshot;
  errorCategory?: string;
  correlationId?: string;
}

const defaultFlags: FeatureFlagSnapshot = {
  enablePdfA: true,
  allowNonAzureAI: false
};

export function getDefaultFeatureFlags(): FeatureFlagSnapshot {
  return { ...defaultFlags };
}

export function createTelemetryEnvelope(
  eventName: TelemetryEnvelope['eventName'],
  host: TelemetryEnvelope['host'],
  overrides: Partial<Omit<TelemetryEnvelope, 'eventName' | 'host'>> = {}
): TelemetryEnvelope {
  return {
    eventName,
    host,
    tenantHash: overrides.tenantHash ?? 'anonymous',
    userHash: overrides.userHash ?? 'anonymous',
    elapsedMs: overrides.elapsedMs ?? 0,
    result: overrides.result ?? 'success',
    featureFlags: overrides.featureFlags ?? getDefaultFeatureFlags(),
    errorCategory: overrides.errorCategory,
    correlationId: overrides.correlationId
  };
}
