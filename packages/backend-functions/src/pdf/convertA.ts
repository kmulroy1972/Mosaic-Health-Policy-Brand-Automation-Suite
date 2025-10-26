import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { convertPdfA } from './services/conversion';
import type { PdfConversionRequest } from './types';

export async function convertPdfAHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestBody = (await request.json()) as PdfConversionRequest;

  try {
    const result = await convertPdfA(requestBody);
    return {
      status: 200,
      jsonBody: result
    };
  } catch (error) {
    context.log(`PDF conversion failure: ${String(error)}`);
    return {
      status: 500,
      jsonBody: {
        error: 'PDF conversion failed.'
      }
    };
  }
}
