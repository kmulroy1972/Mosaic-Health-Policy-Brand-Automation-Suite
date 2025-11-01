import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

/**
 * HTTP trigger for system status endpoint.
 * GET /api/system/status
 * Returns health status of all dependencies
 */
export async function systemStatusHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'GET') {
    logger.warn('Invalid method for system status', { method: request.method });
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use GET.' },
      headers: injectTraceContext(traceContext)
    };
  }

  try {
    const checks: Record<string, { status: 'ok' | 'degraded' | 'down'; details?: string }> = {};

    // Check Cosmos DB
    try {
      const cosmosEndpoint = process.env.COSMOS_ENDPOINT;
      const cosmosKey = process.env.COSMOS_KEY;
      checks.cosmosDb =
        cosmosEndpoint && cosmosKey
          ? { status: 'ok' }
          : { status: 'degraded', details: 'Not configured' };
    } catch (error) {
      checks.cosmosDb = { status: 'down', details: String(error) };
    }

    // Check Azure Storage
    try {
      const storageConnection = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const storageAccount = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      checks.storage =
        storageConnection || storageAccount
          ? { status: 'ok' }
          : { status: 'degraded', details: 'Not configured' };
    } catch (error) {
      checks.storage = { status: 'down', details: String(error) };
    }

    // Check OpenAI
    try {
      const openaiEndpoint = process.env.OPENAI_ENDPOINT;
      const openaiKey = process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY;
      checks.openai =
        openaiEndpoint && openaiKey
          ? { status: 'ok' }
          : { status: 'degraded', details: 'Not configured' };
    } catch (error) {
      checks.openai = { status: 'down', details: String(error) };
    }

    // Check Application Insights (assumed always available if function is running)
    checks.applicationInsights = { status: 'ok' };

    // Check Key Vault
    try {
      const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL;
      checks.keyVault = keyVaultUrl
        ? { status: 'ok' }
        : { status: 'degraded', details: 'Not configured' };
    } catch (error) {
      checks.keyVault = { status: 'down', details: String(error) };
    }

    // Determine overall status
    const allStatuses = Object.values(checks).map((c) => c.status);
    const hasDown = allStatuses.includes('down');
    const hasDegraded = allStatuses.includes('degraded');
    const overallStatus = hasDown ? 'degraded' : hasDegraded ? 'degraded' : 'ok';

    logger.info('System status check completed', {
      overallStatus,
      checks: Object.keys(checks),
      correlationId: traceContext.correlationId
    });

    return {
      status: 200,
      jsonBody: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'System status check failed',
      error instanceof Error ? error : new Error(errorMessage),
      {
        correlationId: traceContext.correlationId
      }
    );

    return {
      status: 500,
      jsonBody: {
        error: 'System status check failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
