import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { getLanguageFromRequest, getTranslator } from './middleware';

/**
 * HTTP trigger for language detection.
 * GET /api/i18n/detect
 * Returns detected language from request headers/query
 */
export async function i18nDetectHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'GET') {
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use GET.' },
      headers: injectTraceContext(traceContext)
    };
  }

  const language = getLanguageFromRequest(request);
  const translator = getTranslator(request);

  logger.info('Language detected', { language, correlationId: traceContext.correlationId });

  return {
    status: 200,
    jsonBody: {
      language,
      detected: true,
      sampleTranslation: translator.translate('brand_guidance_success')
    },
    headers: {
      'Content-Type': 'application/json',
      ...injectTraceContext(traceContext)
    }
  };
}
