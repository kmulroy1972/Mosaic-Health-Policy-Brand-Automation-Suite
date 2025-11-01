import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';

import { getVersionInfo } from './version';

/**
 * HTTP trigger for version endpoint.
 * GET /api/version
 */
export async function versionHttpTrigger(
  request: HttpRequest,
  _context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);

  const versionInfo = getVersionInfo();

  return {
    status: 200,
    jsonBody: versionInfo,
    headers: {
      'Content-Type': 'application/json',
      ...injectTraceContext(traceContext)
    }
  };
}
