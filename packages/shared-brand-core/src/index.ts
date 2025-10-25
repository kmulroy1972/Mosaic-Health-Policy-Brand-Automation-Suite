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
  host: TelemetryEnvelope['host']
): TelemetryEnvelope {
  return {
    eventName,
    tenantHash: 'anonymous',
    userHash: 'anonymous',
    host,
    elapsedMs: 0,
    result: 'success',
    featureFlags: getDefaultFeatureFlags()
  };
}
