import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateAudio, transcribeAudio, type AudioGenerateRequest } from './generate';


/**
 * HTTP trigger for audio generation and transcription.
 * POST /api/audio/generate - Generate audio from text
 * POST /api/audio/transcribe - Transcribe audio to text
 */
export async function audioHttpTrigger(
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
    const urlParts = request.url.split('/');
    const action = urlParts[urlParts.length - 1];

    if (action === 'generate') {
      const body = (await request.json()) as AudioGenerateRequest;

      if (!body.text) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required field: text' },
          headers: injectTraceContext(traceContext)
        };
      }

      logger.info('Audio generation requested', {
        textLength: body.text.length,
        voice: body.voice,
        correlationId: traceContext.correlationId
      });

      const result = await generateAudio(body, context);

      return {
        status: 200,
        jsonBody: result,
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } else if (action === 'transcribe') {
      const audioBuffer = await request.arrayBuffer();
      const language = request.query.get('language') || 'en-US';

      if (!audioBuffer || audioBuffer.byteLength === 0) {
        return {
          status: 400,
          jsonBody: { error: 'Missing audio data' },
          headers: injectTraceContext(traceContext)
        };
      }

      logger.info('Audio transcription requested', {
        audioSize: audioBuffer.byteLength,
        language,
        correlationId: traceContext.correlationId
      });

      const transcription = await transcribeAudio(Buffer.from(audioBuffer), language, context);

      return {
        status: 200,
        jsonBody: {
          transcription,
          language,
          transcribedAt: new Date().toISOString()
        },
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } else {
      return {
        status: 400,
        jsonBody: { error: `Invalid action: ${action}. Use: generate or transcribe` },
        headers: injectTraceContext(traceContext)
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Audio operation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Audio operation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
