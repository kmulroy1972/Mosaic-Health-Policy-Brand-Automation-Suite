import 'office-js';

import { logError, logEvent } from '../utils/logging';

export interface ExportPdfOptions {
  convertToPdfA?: boolean;
  validateAccessibility?: boolean;
}

const DEFAULT_ENDPOINT = '/api/pdf/convertA';
const VALIDATE_ENDPOINT = '/api/pdf/validate';

async function convertLocally(document: Word.Document): Promise<string> {
  return new Promise((resolve, reject) => {
    (document as any).getFileAsync(
      Office.FileType.Pdf,
      (result: Office.AsyncResult<Office.File>) => {
        if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
          const file = result.value;
          file.getSliceAsync(0, (sliceResult: Office.AsyncResult<Office.Slice>) => {
            if (sliceResult.status === Office.AsyncResultStatus.Succeeded && sliceResult.value) {
              resolve(sliceResult.value.data as string);
              file.closeAsync(() => {
                /* noop */
              });
            } else {
              reject(sliceResult.error);
            }
          });
        } else {
          reject(result.error);
        }
      }
    );
  });
}

async function convertViaService(
  contentBase64: string,
  { convertToPdfA }: ExportPdfOptions
): Promise<string> {
  const response = await fetch(DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentBase64, convertToPdfA })
  });
  if (!response.ok) {
    throw new Error('PDF conversion service failed');
  }
  const json = (await response.json()) as { pdfBase64: string };
  return json.pdfBase64;
}

async function validatePdf(pdfBase64: string, options: ExportPdfOptions) {
  if (!options.validateAccessibility) {
    return;
  }
  const response = await fetch(VALIDATE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64, runPdfA: options.convertToPdfA })
  });
  if (response.ok) {
    const result = await response.json();
    logEvent('pdf_validation_result', result);
  }
}

export async function exportPdf(options: ExportPdfOptions = {}): Promise<void> {
  try {
    await Word.run(async (context) => {
      const document = context.document;
      const localPdf = await convertLocally(document);
      let pdf = localPdf;
      if (options.convertToPdfA) {
        pdf = await convertViaService(localPdf, options);
      }
      await validatePdf(pdf, options);
    });
  } catch (error) {
    logError('pdf_export_failed', error);
    throw error;
  }
}
