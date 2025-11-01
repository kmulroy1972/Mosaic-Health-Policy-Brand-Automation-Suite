import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { downloadBlob, uploadBlob } from './blobClient';

/**
 * HTTP trigger for blob storage upload.
 * POST /api/storage/upload
 * Body: { container?: string, blobName: string, content: string (base64), contentType?: string }
 */
export async function storageUploadHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'POST') {
    logger.warn('Invalid method for storage upload', { method: request.method });
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use POST.' },
      headers: injectTraceContext(traceContext)
    };
  }

  // Require authentication
  const authResult = await authenticateRequest(request, context, {
    requireAuth: true,
    allowedScopes: ['access_as_user']
  });

  if (!authResult.authenticated || !authResult.context) {
    logger.warn('Unauthenticated storage upload request rejected', {
      correlationId: traceContext.correlationId
    });
    return {
      ...(authResult.error || {
        status: 401,
        jsonBody: { error: 'Unauthorized' }
      }),
      headers: injectTraceContext(traceContext)
    };
  }

  try {
    const body = (await request.json()) as {
      container?: string;
      blobName: string;
      content: string; // base64 encoded
      contentType?: string;
    };

    if (!body.blobName || !body.content) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: blobName, content' },
        headers: injectTraceContext(traceContext)
      };
    }

    // Decode base64 content
    const contentBuffer = Buffer.from(body.content, 'base64');
    const containerName = body.container || 'mhp-assets';

    logger.info('Uploading blob', {
      blobName: body.blobName,
      container: containerName,
      size: contentBuffer.length,
      correlationId: traceContext.correlationId
    });

    const result = await uploadBlob(
      containerName,
      body.blobName,
      contentBuffer,
      body.contentType,
      context
    );

    logger.info('Blob uploaded successfully', {
      blobName: result.blobName,
      url: result.url,
      correlationId: traceContext.correlationId
    });

    return {
      status: 200,
      jsonBody: result,
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Storage upload failed',
      error instanceof Error ? error : new Error(errorMessage),
      {
        correlationId: traceContext.correlationId
      }
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Storage upload failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}

/**
 * HTTP trigger for blob storage download.
 * GET /api/storage/download?container=...&blobName=...
 */
export async function storageDownloadHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'GET') {
    logger.warn('Invalid method for storage download', { method: request.method });
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use GET.' },
      headers: injectTraceContext(traceContext)
    };
  }

  // Require authentication
  const authResult = await authenticateRequest(request, context, {
    requireAuth: true,
    allowedScopes: ['access_as_user']
  });

  if (!authResult.authenticated || !authResult.context) {
    logger.warn('Unauthenticated storage download request rejected', {
      correlationId: traceContext.correlationId
    });
    return {
      ...(authResult.error || {
        status: 401,
        jsonBody: { error: 'Unauthorized' }
      }),
      headers: injectTraceContext(traceContext)
    };
  }

  try {
    const containerName = request.query.get('container') || 'mhp-assets';
    const blobName = request.query.get('blobName');

    if (!blobName) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required query parameter: blobName' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Downloading blob', {
      blobName,
      container: containerName,
      correlationId: traceContext.correlationId
    });

    const buffer = await downloadBlob(containerName, blobName, context);

    // Return as base64 for JSON response
    const base64Content = buffer.toString('base64');

    logger.info('Blob downloaded successfully', {
      blobName,
      size: buffer.length,
      correlationId: traceContext.correlationId
    });

    return {
      status: 200,
      jsonBody: {
        blobName,
        container: containerName,
        content: base64Content,
        size: buffer.length
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Storage download failed',
      error instanceof Error ? error : new Error(errorMessage),
      {
        correlationId: traceContext.correlationId
      }
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Storage download failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
