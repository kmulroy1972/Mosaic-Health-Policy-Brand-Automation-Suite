import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

import type { HealthCheckResponse } from './types';

const VERSION = '0.0.1';

export async function healthHttpTrigger(
  _request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const telemetry = createTelemetryEnvelope('health_check', 'backend');

  try {
    const checks = {
      aiClient: checkAIClient(),
      graphClient: checkGraphClient(),
      storage: checkStorage()
    };

    const allHealthy = Object.values(checks).every((status) => status === 'ok');
    const status = allHealthy ? 'healthy' : 'degraded';

    const body: HealthCheckResponse = {
      status,
      version: VERSION,
      timestamp: new Date().toISOString(),
      checks
    };

    context.log(`Health check completed: ${status}`, telemetry.eventName);

    return {
      status: 200,
      jsonBody: body,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    context.error(`Health check failed: ${String(error)}`);
    return {
      status: 500,
      jsonBody: {
        error: 'Health check failed.'
      }
    };
  }
}

function checkAIClient(): 'ok' | 'unconfigured' {
  const endpoint = process.env.OPENAI_ENDPOINT;
  const deployment = process.env.OPENAI_DEPLOYMENT;
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.AZURE_OPENAI_KEY;

  return endpoint && deployment && apiKey ? 'ok' : 'unconfigured';
}

function checkGraphClient(): 'ok' | 'unconfigured' {
  // Check if Graph access token or Azure credentials are available
  const hasToken = !!process.env.GRAPH_ACCESS_TOKEN;
  const hasCredentials =
    !!process.env.AZURE_TENANT_ID || !!process.env.AZURE_CLIENT_ID || !!process.env.MSI_ENDPOINT;

  return hasToken || hasCredentials ? 'ok' : 'unconfigured';
}

function checkStorage(): 'ok' | 'unconfigured' {
  // Check for Azure Storage connection string or account details
  const hasConnectionString = !!process.env.AZURE_STORAGE_CONNECTION_STRING;
  const hasAccountDetails =
    !!process.env.AZURE_STORAGE_ACCOUNT_NAME && !!process.env.AZURE_STORAGE_ACCOUNT_KEY;

  return hasConnectionString || hasAccountDetails ? 'ok' : 'unconfigured';
}
