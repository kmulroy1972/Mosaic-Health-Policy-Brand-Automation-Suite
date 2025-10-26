export interface PdfConversionRequest {
  contentBase64: string;
  convertToPdfA?: boolean;
}

export interface PdfConversionResponse {
  pdfBase64: string;
  pdfa?: boolean;
}

export interface PdfValidationRequest {
  pdfBase64: string;
  runPdfA?: boolean;
}

export interface PdfValidationReport {
  passed: boolean;
  reportUrl?: string;
}

export interface PdfValidationResponse {
  pdfua: PdfValidationReport;
  pdfa: PdfValidationReport;
}
