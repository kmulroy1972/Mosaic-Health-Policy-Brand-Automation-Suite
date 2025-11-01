import type { InvocationContext } from '@azure/functions';

/**
 * Accessibility validation result structure
 */
export interface A11yValidationResult {
  violations: AccessibilityViolation[];
  wcagScore: number; // 0-100
  reportUrl?: string;
  timestamp: string;
  documentType: 'pdf' | 'html' | 'docx';
}

/**
 * Accessibility violation details
 */
export interface AccessibilityViolation {
  rule: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  element?: string;
  html?: string;
}

/**
 * Validation request
 */
export interface A11yValidationRequest {
  content: string; // base64 encoded content
  contentType: 'pdf' | 'html' | 'docx';
  url?: string; // optional URL if content is hosted
}

/**
 * Main accessibility validator that uses axe-core principles, PAC 3 CLI, and Apryse SDK
 * Returns structured JSON with violations, WCAG score, and report URL
 */
export async function validateAccessibility(
  request: A11yValidationRequest,
  context: InvocationContext
): Promise<A11yValidationResult> {
  const violations: AccessibilityViolation[] = [];
  let wcagScore = 100;

  try {
    context.log('Starting accessibility validation', { contentType: request.contentType });

    // Decode base64 content
    const contentBuffer = Buffer.from(request.content, 'base64');

    if (request.contentType === 'html') {
      const htmlContent = contentBuffer.toString('utf-8');
      const htmlResult = await validateHTML(htmlContent, context);
      violations.push(...htmlResult.violations);
      wcagScore = htmlResult.wcagScore;
    } else if (request.contentType === 'pdf') {
      const pdfResult = await validatePDF(contentBuffer, context);
      violations.push(...pdfResult.violations);
      wcagScore = pdfResult.wcagScore;
    } else if (request.contentType === 'docx') {
      const docxResult = await validateDOCX(contentBuffer, context);
      violations.push(...docxResult.violations);
      wcagScore = docxResult.wcagScore;
    }

    // Calculate final WCAG score (deduct points for violations)
    wcagScore = Math.max(0, Math.min(100, wcagScore));

    // Generate report URL (placeholder - in production, store reports in blob storage)
    const reportUrl = request.url
      ? `${request.url}/compliance-report-${Date.now()}.json`
      : undefined;

    return {
      violations,
      wcagScore,
      reportUrl,
      timestamp: new Date().toISOString(),
      documentType: request.contentType
    };
  } catch (error) {
    context.error('Accessibility validation error', error);
    throw new Error(
      `Accessibility validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validates HTML content using axe-core principles
 * Note: In production, this would use axe-core in a headless browser
 */
async function validateHTML(
  htmlContent: string,
  context: InvocationContext
): Promise<{ violations: AccessibilityViolation[]; wcagScore: number }> {
  const violations: AccessibilityViolation[] = [];
  let score = 100;

  // Parse HTML (simplified - in production use proper HTML parser)
  const hasTitle = /<title[^>]*>/.test(htmlContent);
  const hasLang = /<html[^>]*lang=["']/.test(htmlContent);
  const images = htmlContent.match(/<img[^>]*>/g) || [];
  const headings = htmlContent.match(/<h[1-6][^>]*>/g) || [];

  // Check for missing title
  if (!hasTitle) {
    violations.push({
      rule: 'document-title',
      severity: 'error',
      description: 'Document must have a title element',
      wcagLevel: 'A',
      element: 'document'
    });
    score -= 15;
  }

  // Check for missing lang attribute
  if (!hasLang) {
    violations.push({
      rule: 'html-has-lang',
      severity: 'error',
      description: 'HTML element must have a lang attribute',
      wcagLevel: 'A',
      element: 'html'
    });
    score -= 10;
  }

  // Check images for alt text
  images.forEach((imgTag, index) => {
    if (!/alt=["']/.test(imgTag)) {
      violations.push({
        rule: 'image-alt',
        severity: 'error',
        description: 'Images must have alternative text',
        wcagLevel: 'A',
        element: `image-${index}`,
        html: imgTag
      });
      score -= 5;
    }
  });

  // Check heading hierarchy
  if (headings.length === 0) {
    violations.push({
      rule: 'heading-order',
      severity: 'warning',
      description: 'Document should have proper heading hierarchy',
      wcagLevel: 'AA',
      element: 'document'
    });
    score -= 5;
  }

  // Check for color contrast (simplified)
  const styleTags = htmlContent.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [];
  const inlineStyles = htmlContent.match(/style=["'][^"']*color[^"']*["']/g) || [];
  if (styleTags.length > 0 || inlineStyles.length > 0) {
    violations.push({
      rule: 'color-contrast',
      severity: 'warning',
      description: 'Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)',
      wcagLevel: 'AA',
      element: 'styles'
    });
    // Don't deduct points, just warn - actual contrast calculation requires rendering
  }

  // Check for form labels
  const inputs = htmlContent.match(/<input[^>]*>/g) || [];
  const textareas = htmlContent.match(/<textarea[^>]*>/g) || [];
  const selects = htmlContent.match(/<select[^>]*>/g) || [];
  const formFields = [...inputs, ...textareas, ...selects];

  formFields.forEach((field, index) => {
    const hasId = /id=["']([^"']+)["']/.test(field);
    const fieldId = hasId ? field.match(/id=["']([^"']+)["']/)?.[1] : null;
    const hasLabel = fieldId
      ? new RegExp(`<label[^>]*for=["']${fieldId}["']`).test(htmlContent)
      : false;
    const hasAriaLabel = /aria-label=["']/.test(field);
    const hasAriaLabelledBy = /aria-labelledby=["']/.test(field);

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      violations.push({
        rule: 'label',
        severity: 'error',
        description: 'Form fields must have associated labels',
        wcagLevel: 'A',
        element: `form-field-${index}`,
        html: field
      });
      score -= 5;
    }
  });

  context.log('HTML validation completed', {
    violationCount: violations.length,
    score
  });

  return { violations, wcagScore: Math.max(0, score) };
}

/**
 * Validates PDF content using Apryse SDK principles
 * Note: In production, use Apryse SDK or PAC 3 CLI for full PDF/UA compliance
 */
async function validatePDF(
  pdfBuffer: Buffer,
  context: InvocationContext
): Promise<{ violations: AccessibilityViolation[]; wcagScore: number }> {
  const violations: AccessibilityViolation[] = [];
  let score = 100;

  // Basic PDF structure checks
  // In production, use Apryse SDK or pdf-lib for detailed parsing
  const pdfString = pdfBuffer.toString('binary', 0, Math.min(1000, pdfBuffer.length));

  // Check for PDF header
  if (!pdfString.startsWith('%PDF')) {
    violations.push({
      rule: 'pdf-structure',
      severity: 'critical',
      description: 'Invalid PDF structure',
      wcagLevel: 'A',
      element: 'document'
    });
    score -= 50;
    return { violations, wcagScore: Math.max(0, score) };
  }

  // Check for text layer (simplified - in production use PDF parser)
  const hasText = /\/Text|stream[\s\S]*?endstream/i.test(pdfBuffer.toString('binary'));
  if (!hasText) {
    violations.push({
      rule: 'pdf-text-layer',
      severity: 'error',
      description: 'PDF may be image-only without searchable text layer',
      wcagLevel: 'AA',
      element: 'document'
    });
    score -= 20;
  }

  // Check for PDF/UA markers (simplified)
  const hasTagged = /\/MarkInfo|\/StructTreeRoot/i.test(pdfBuffer.toString('binary'));
  if (!hasTagged) {
    violations.push({
      rule: 'pdf-tagged',
      severity: 'warning',
      description: 'PDF should be tagged for accessibility (PDF/UA compliance)',
      wcagLevel: 'AA',
      element: 'document'
    });
    score -= 10;
  }

  // Check for metadata (Title, Author)
  const hasMetadata = /\/Metadata|\/Info/i.test(pdfBuffer.toString('binary'));
  if (!hasMetadata) {
    violations.push({
      rule: 'pdf-metadata',
      severity: 'warning',
      description: 'PDF should include metadata (title, author)',
      wcagLevel: 'A',
      element: 'document'
    });
    score -= 5;
  }

  context.log('PDF validation completed', {
    violationCount: violations.length,
    score
  });

  return { violations, wcagScore: Math.max(0, score) };
}

/**
 * Validates DOCX content
 * Note: In production, use docx-parser or similar library
 */
async function validateDOCX(
  docxBuffer: Buffer,
  context: InvocationContext
): Promise<{ violations: AccessibilityViolation[]; wcagScore: number }> {
  const violations: AccessibilityViolation[] = [];
  let score = 100;

  // Check for DOCX structure (ZIP-based format)
  const zipHeader = [0x50, 0x4b, 0x03, 0x04]; // PK..
  const hasZipHeader =
    docxBuffer.length >= 4 && zipHeader.every((byte, index) => docxBuffer[index] === byte);

  if (!hasZipHeader) {
    violations.push({
      rule: 'docx-structure',
      severity: 'critical',
      description: 'Invalid DOCX structure',
      wcagLevel: 'A',
      element: 'document'
    });
    score -= 50;
    return { violations, wcagScore: Math.max(0, score) };
  }

  // Basic checks (in production, parse DOCX XML structure)
  violations.push({
    rule: 'docx-alt-text',
    severity: 'warning',
    description: 'Ensure images in DOCX have alternative text descriptions',
    wcagLevel: 'A',
    element: 'document'
  });
  score -= 5;

  violations.push({
    rule: 'docx-headings',
    severity: 'info',
    description: 'Use proper heading styles for document structure',
    wcagLevel: 'AA',
    element: 'document'
  });
  // Don't deduct for info-level violations

  context.log('DOCX validation completed', {
    violationCount: violations.length,
    score
  });

  return { violations, wcagScore: Math.max(0, score) };
}

/**
 * Runs PAC 3 CLI validation (placeholder - requires PAC 3 installation)
 * In production, this would call PAC 3 CLI as a subprocess
 */
export async function runPAC3Validation(
  pdfPath: string,
  context: InvocationContext
): Promise<AccessibilityViolation[]> {
  context.log('PAC 3 CLI validation (stub)', { pdfPath });
  // TODO: Execute PAC 3 CLI: pac3 -f <pdfPath> --json
  // For now, return empty array
  return [];
}
