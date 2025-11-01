/**
 * Mosaic Report Generator - HTML executive reports
 */

import type { InvocationContext } from '@azure/functions';

export interface ReportSection {
  type: 'overview' | 'policyImpact' | 'dataVisuals' | 'compliance';
  title: string;
  content: string;
  data?: unknown;
}

export interface ReportRequest {
  title: string;
  sections: ReportSection[];
  clientId?: string;
}

export interface GeneratedReport {
  reportId: string;
  html: string;
  gammaDeckUrl?: string;
  createdAt: string;
}

export async function generateExecutiveReport(
  request: ReportRequest,
  context: InvocationContext
): Promise<GeneratedReport> {
  const reportId = `report-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Generate HTML report
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${request.title}</title>
  <style>
    body { font-family: Futura, sans-serif; color: #1F2937; line-height: 1.6; }
    .header { background: #1E3A8A; color: white; padding: 2rem; }
    .section { margin: 2rem 0; padding: 1.5rem; border-left: 4px solid #059669; }
    .section h2 { color: #1E3A8A; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${request.title}</h1>
    <p>Generated: ${new Date().toISOString()}</p>
  </div>
`;

  for (const section of request.sections) {
    html += `
  <div class="section">
    <h2>${section.title}</h2>
    <div>${section.content}</div>
  </div>
`;
  }

  html += `
</body>
</html>`;

  context.log('Executive report generated', {
    reportId,
    title: request.title,
    sectionsCount: request.sections.length
  });

  return {
    reportId,
    html,
    createdAt: new Date().toISOString()
  };
}
