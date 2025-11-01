import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { templateRepository } from '../db/repositories';
import { exportToGamma } from '../gamma/client';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateExecutiveReport, type ReportRequest } from './generator';


/**
 * HTTP trigger for report generation.
 * POST /api/reports/generate
 */
export async function reportsGenerateHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'POST') {
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use POST.' },
      headers: injectTraceContext(traceContext)
    };
  }

  const authResult = await authenticateRequest(request, context, {
    requireAuth: true
  });

  if (!authResult.authenticated || !authResult.context) {
    return {
      ...(authResult.error || {
        status: 401,
        jsonBody: { error: 'Unauthorized' }
      }),
      headers: injectTraceContext(traceContext)
    };
  }

  try {
    const body = (await request.json()) as ReportRequest & { exportToGamma?: boolean };

    if (!body.title || !body.sections) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: title, sections' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Report generation requested', {
      title: body.title,
      correlationId: traceContext.correlationId
    });

    // Generate HTML report
    const report = await generateExecutiveReport(body, context);

    // Export to Gamma if requested
    let gammaDeckUrl: string | undefined;
    if (body.exportToGamma) {
      const gammaExport = await exportToGamma({
        content: report.html,
        title: body.title
      });
      gammaDeckUrl = gammaExport.publicUrl;
      report.gammaDeckUrl = gammaDeckUrl;

      // Store in Cosmos DB if clientId provided
      if (body.clientId) {
        // TODO: Store report metadata with gammaDeckUrl
        await templateRepository.upsert(
          {
            id: report.reportId,
            name: body.title,
            description: `Report generated with Gamma deck: ${gammaDeckUrl}`,
            lastModified: new Date().toISOString(),
            metadata: {
              gammaDeckUrl,
              reportId: report.reportId
            }
          } as never,
          context
        );
      }
    }

    return {
      status: 200,
      jsonBody: {
        reportId: report.reportId,
        html: report.html,
        gammaDeckUrl,
        createdAt: report.createdAt
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Report generation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Report generation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
