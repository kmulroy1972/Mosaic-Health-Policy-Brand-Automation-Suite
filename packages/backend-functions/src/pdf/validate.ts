import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { validateAccessibility } from './services/validation';
import type { AccessibilityValidationRequest } from './types';

/**
 * HTTP trigger for PDF validation (WCAG/508 compliance).
 * Input: {pdfBase64: string}
 * Output: {issues: [], score: 0-100, summary: string}
 */
export async function validatePdfHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // Validate request body
  let requestBody: AccessibilityValidationRequest;
  try {
    const body = (await request.json()) as AccessibilityValidationRequest;

    if (!body.pdfBase64 || typeof body.pdfBase64 !== 'string') {
      return {
        status: 400,
        jsonBody: { error: 'Missing or invalid pdfBase64 field.' }
      };
    }

    requestBody = body;
  } catch (error) {
    context.log('pdf_validate_invalid_json', String(error ?? 'unknown'));
    return {
      status: 400,
      jsonBody: { error: 'Invalid JSON payload. Expected {pdfBase64: string}.' }
    };
  }

  try {
    const result = await validateAccessibility(requestBody);
    context.log('pdf_validation_completed', {
      score: result.score,
      issueCount: result.issues.length
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
    context.error(`PDF validation failure: ${errorMessage}`);
    return {
      status: 500,
      jsonBody: {
        error: 'PDF validation failed.',
        details: errorMessage
      }
    };
  }
}
