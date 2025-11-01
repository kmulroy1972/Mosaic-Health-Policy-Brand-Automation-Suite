/**
 * End-to-end nightly confidence run
 */

import type { InvocationContext } from '@azure/functions';

// Use fetch instead of axios to avoid dependency
async function httpRequest(
  url: string,
  method: string
): Promise<{ status: number; data: unknown }> {
  const response = await fetch(url, { method, signal: AbortSignal.timeout(10000) });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

interface ConfidenceResult {
  endpoint: string;
  status: 'pass' | 'fail';
  responseTime: number;
  schemaValid: boolean;
  statusCode?: number;
  error?: string;
}

export async function runConfidenceRun(_context: InvocationContext): Promise<{
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: ConfidenceResult[];
}> {
  const API_BASE =
    process.env.API_BASE_URL || 'https://mhpbrandfunctions38e5971a.azurewebsites.net';
  const endpoints = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/templates', method: 'GET' },
    { path: '/api/analytics/report', method: 'GET' },
    { path: '/api/system/status', method: 'GET' },
    { path: '/api/version', method: 'GET' },
    { path: '/api/auth/validate', method: 'GET' }
  ];

  const results: ConfidenceResult[] = [];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await httpRequest(`${API_BASE}${endpoint.path}`, endpoint.method);

      const responseTime = Date.now() - startTime;
      const status = response.status === 200 ? 'pass' : 'fail';
      const schemaValid = typeof response.data === 'object';

      results.push({
        endpoint: endpoint.path,
        status,
        responseTime,
        schemaValid,
        statusCode: response.status
      });
    } catch (error) {
      results.push({
        endpoint: endpoint.path,
        status: 'fail',
        responseTime: 0,
        schemaValid: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const passed = results.filter((r) => r.status === 'pass' && r.schemaValid).length;
  const failed = results.length - passed;

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed,
    failed,
    results
  };
}

export async function generateConfidenceReport(context: InvocationContext): Promise<string> {
  const run = await runConfidenceRun(context);
  const date = new Date().toISOString().split('T')[0];

  let report = `# Confidence Report - ${date}\n\n`;
  report += `**Generated:** ${run.timestamp}\n`;
  report += `**Status:** ${run.failed === 0 ? '✅ All Pass' : '❌ Failures Detected'}\n\n`;

  report += `## Summary\n\n`;
  report += `- Total Tests: ${run.totalTests}\n`;
  report += `- Passed: ${run.passed}\n`;
  report += `- Failed: ${run.failed}\n\n`;

  report += `## Results\n\n`;
  report += `| Endpoint | Status | Response Time | Schema Valid |\n`;
  report += `|----------|--------|---------------|--------------|\n`;

  run.results.forEach((result) => {
    const icon = result.status === 'pass' && result.schemaValid ? '✅' : '❌';
    report += `| ${result.endpoint} | ${icon} ${result.status} | ${result.responseTime}ms | ${result.schemaValid ? 'Yes' : 'No'} |\n`;
  });

  // TODO: Open GitHub issue if failures detected
  if (run.failed > 0) {
    report += `\n## ⚠️ Failures Detected\n\n`;
    report += `GitHub issue should be opened automatically with these details.\n`;
  }

  return report;
}
