export interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  version: string;
  timestamp: string;
  checks: {
    aiClient: 'ok' | 'unconfigured';
    graphClient: 'ok' | 'unconfigured';
    storage: 'ok' | 'unconfigured';
  };
}
