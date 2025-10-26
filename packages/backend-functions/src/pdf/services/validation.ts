import type { PdfValidationRequest, PdfValidationResponse } from '../types';

export async function validatePdf(_request: PdfValidationRequest): Promise<PdfValidationResponse> {
  // TODO: integrate veraPDF or Azure containerized validator.
  return {
    pdfua: {
      passed: true,
      reportUrl: undefined
    },
    pdfa: {
      passed: true,
      reportUrl: undefined
    }
  };
}
