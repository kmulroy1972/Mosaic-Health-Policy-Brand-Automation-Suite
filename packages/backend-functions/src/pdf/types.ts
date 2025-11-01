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

// WCAG/508 Compliance types
export interface AccessibilityIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
}

export interface AccessibilityValidationRequest {
  pdfBase64: string;
}

export interface AccessibilityValidationResponse {
  issues: AccessibilityIssue[];
  score: number; // 0-100
  summary: string;
}
