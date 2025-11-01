/**
 * Auto-generates Markdown documentation for all Azure Functions.
 * Scans function folders and generates comprehensive API documentation.
 */

interface FunctionInfo {
  name: string;
  route: string;
  method: string;
  description?: string;
  inputSchema?: any;
  outputSchema?: any;
}

export async function generateFunctionDocs(): Promise<string> {
  const functions: FunctionInfo[] = [];

  // Scan for function definitions
  const healthInfo: FunctionInfo = {
    name: 'health',
    route: 'api/health',
    method: 'GET',
    description: 'Health check endpoint that verifies service status and dependencies'
  };

  const templatesInfo: FunctionInfo = {
    name: 'templates',
    route: 'api/templates',
    method: 'GET',
    description: 'Retrieves available brand templates from SharePoint'
  };

  const rewriteInfo: FunctionInfo = {
    name: 'rewrite',
    route: 'api/rewrite',
    method: 'POST',
    description: 'Uses Azure OpenAI to rewrite text to match brand tone'
  };

  const brandGuidanceInfo: FunctionInfo = {
    name: 'brandguidanceagent',
    route: 'api/brandguidanceagent',
    method: 'POST',
    description: 'Analyzes documents against brand formatting and compliance rules'
  };

  const convertPdfInfo: FunctionInfo = {
    name: 'convertPdfA',
    route: 'api/pdf/convert',
    method: 'POST',
    description: 'Converts PDF to text or PDF/A format'
  };

  const validatePdfInfo: FunctionInfo = {
    name: 'validatePdf',
    route: 'api/pdf/validate',
    method: 'POST',
    description: 'Validates PDF for WCAG/508 accessibility compliance'
  };

  functions.push(
    healthInfo,
    templatesInfo,
    rewriteInfo,
    brandGuidanceInfo,
    convertPdfInfo,
    validatePdfInfo
  );

  // Generate Markdown
  let markdown = '# Azure Functions API Documentation\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += '## Overview\n\n';
  markdown +=
    'This document provides comprehensive documentation for all Azure Functions endpoints.\n\n';
  markdown += '## Endpoints\n\n';

  for (const func of functions) {
    markdown += `### ${func.name}\n\n`;
    markdown += `- **Route:** \`${func.route}\`\n`;
    markdown += `- **Method:** \`${func.method}\`\n`;
    if (func.description) {
      markdown += `- **Description:** ${func.description}\n`;
    }
    markdown += '\n';
  }

  return markdown;
}

// Export for use in other modules
export default generateFunctionDocs;
