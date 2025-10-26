import type { PdfConversionRequest, PdfConversionResponse } from '../types';

export async function convertPdfA(request: PdfConversionRequest): Promise<PdfConversionResponse> {
  // TODO: integrate Ghostscript or Azure containerized service for PDF/A-2b conversion.
  return {
    pdfBase64: request.contentBase64,
    pdfa: request.convertToPdfA ?? false
  };
}
