import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { convertPdfA } from './services/conversion';
import type { PdfConversionRequest } from './types';

/**
 * HTTP trigger for PDF to text conversion.
 * Input: {contentBase64: string, convertToPdfA?: boolean}
 * Output: {pdfBase64: string, pdfa: boolean} or text content
 */
export async function convertPdfAHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // Validate request body
  let requestBody: PdfConversionRequest;
  try {
    const body = (await request.json()) as PdfConversionRequest;

    if (!body.contentBase64 || typeof body.contentBase64 !== 'string') {
      return {
        status: 400,
        jsonBody: { error: 'Missing or invalid contentBase64 field.' }
      };
    }

    requestBody = body;
  } catch (error) {
    context.log('pdf_convert_invalid_json', String(error ?? 'unknown'));
    return {
      status: 400,
      jsonBody: {
        error: 'Invalid JSON payload. Expected {contentBase64: string, convertToPdfA?: boolean}.'
      }
    };
  }

  try {
    const result = await convertPdfA(requestBody);
    context.log('pdf_conversion_completed', { pdfa: result.pdfa });

    return {
      status: 200,
      jsonBody: result,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    context.error(`PDF conversion failure: ${errorMessage}`);
    return {
      status: 500,
      jsonBody: {
        error: 'PDF conversion failed.',
        details: errorMessage
      }
    };
  }
}
