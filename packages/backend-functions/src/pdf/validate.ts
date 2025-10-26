import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { validatePdf } from './services/validation';
import type { PdfValidationRequest } from './types';

export async function validatePdfHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestBody = (await request.json()) as PdfValidationRequest;

  try {
    const result = await validatePdf(requestBody);
    return {
      status: 200,
      jsonBody: result
    };
  } catch (error) {
    context.log(`PDF validation failure: ${String(error)}`);
    return {
      status: 500,
      jsonBody: {
        error: 'PDF validation failed.'
      }
    };
  }
}
