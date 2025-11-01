import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { validateAccessibility, type A11yValidationRequest } from './a11yValidator';

/**
 * HTTP trigger for compliance validation endpoint.
 * POST /api/compliance/validate
 * Body: { content: string (base64), contentType: 'pdf' | 'html' | 'docx', url?: string }
 * Returns: { violations, wcagScore, reportUrl, timestamp, documentType }
 */
export async function complianceValidateHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method !== 'POST') {
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use POST.' }
    };
  }

  let requestBody: A11yValidationRequest;
  try {
    const body = (await request.json()) as A11yValidationRequest;

    if (!body.content || typeof body.content !== 'string') {
      return {
        status: 400,
        jsonBody: { error: 'Missing or invalid content field (base64 string required).' }
      };
    }

    if (!body.contentType || !['pdf', 'html', 'docx'].includes(body.contentType)) {
      return {
        status: 400,
        jsonBody: {
          error: 'Missing or invalid contentType. Must be one of: pdf, html, docx'
        }
      };
    }

    requestBody = body;
  } catch (error) {
    context.log('compliance_validate_invalid_json', String(error ?? 'unknown'));
    return {
      status: 400,
      jsonBody: { error: 'Invalid JSON payload.' }
    };
  }

  try {
    const result = await validateAccessibility(requestBody, context);

    context.log('compliance_validation_completed', {
      documentType: result.documentType,
      wcagScore: result.wcagScore,
      violationCount: result.violations.length
    });

    return {
      status: 200,
      jsonBody: result,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    context.error(`Compliance validation failure: ${errorMessage}`);
    return {
      status: 500,
      jsonBody: {
        error: 'Compliance validation failed.',
        details: errorMessage
      }
    };
  }
}
