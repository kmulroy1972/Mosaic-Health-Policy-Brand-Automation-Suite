import type { InvocationContext } from '@azure/functions';

import { auditLogRepository } from '../db/repositories';

/**
 * Analytics report data structure
 */
export interface AnalyticsReport {
  date: string;
  summary: {
    totalRequests: number;
    successRate: number;
    errorRate: number;
    averageResponseTime: number;
  };
  endpoints: Array<{
    endpoint: string;
    requestCount: number;
    successCount: number;
    errorCount: number;
    averageDuration: number;
  }>;
  compliance: {
    totalScans: number;
    averageWcagScore: number;
    violationsByType: Record<string, number>;
  };
  brandGuidance: {
    totalRequests: number;
    averageTokensUsed: number;
    successRate: number;
  };
  pdfProcessing: {
    totalConversions: number;
    totalValidations: number;
    averageProcessingTime: number;
  };
  users: {
    uniqueUsers: number;
    activeUsers: number; // Users with > 5 requests
  };
}

/**
 * Generate analytics report from audit logs
 */
export async function generateAnalyticsReport(
  startDate: Date,
  endDate: Date,
  context?: InvocationContext
): Promise<AnalyticsReport> {
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();

  // Query all audit logs for the date range
  const allLogs = await auditLogRepository.query(
    {
      startDate: startDateStr,
      endDate: endDateStr,
      limit: 10000 // Large limit for comprehensive reports
    },
    context
  );

  const totalRequests = allLogs.length;
  const successLogs = allLogs.filter((log) => log.status === 'success');
  const errorLogs = allLogs.filter((log) => log.status === 'error');
  const successRate = totalRequests > 0 ? (successLogs.length / totalRequests) * 100 : 0;
  const errorRate = totalRequests > 0 ? (errorLogs.length / totalRequests) * 100 : 0;

  // Calculate average response time
  const durations = allLogs
    .map((log) => log.duration)
    .filter((d) => d !== undefined && d > 0) as number[];
  const averageResponseTime =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  // Group by endpoint/action
  const endpointStats = new Map<
    string,
    { count: number; success: number; error: number; durations: number[] }
  >();

  allLogs.forEach((log) => {
    const key = log.action || 'unknown';
    const stats = endpointStats.get(key) || { count: 0, success: 0, error: 0, durations: [] };
    stats.count++;
    if (log.status === 'success') stats.success++;
    if (log.status === 'error') stats.error++;
    if (log.duration) stats.durations.push(log.duration);
    endpointStats.set(key, stats);
  });

  const endpoints = Array.from(endpointStats.entries()).map(([endpoint, stats]) => ({
    endpoint,
    requestCount: stats.count,
    successCount: stats.success,
    errorCount: stats.error,
    averageDuration:
      stats.durations.length > 0
        ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length
        : 0
  }));

  // Compliance statistics
  const complianceLogs = allLogs.filter((log) => log.action === 'compliance_validate');
  const complianceMetadata = complianceLogs
    .map((log) => log.metadata?.wcagScore as number | undefined)
    .filter((score) => score !== undefined) as number[];
  const averageWcagScore =
    complianceMetadata.length > 0
      ? complianceMetadata.reduce((a, b) => a + b, 0) / complianceMetadata.length
      : 0;

  const violationsByType: Record<string, number> = {};
  complianceLogs.forEach((log) => {
    const violations = (log.metadata?.violations as Array<{ type: string }>) || [];
    violations.forEach((v) => {
      violationsByType[v.type] = (violationsByType[v.type] || 0) + 1;
    });
  });

  // Brand guidance statistics
  const brandGuidanceLogs = allLogs.filter((log) => log.action === 'brand_guidance');
  const tokenCounts = brandGuidanceLogs
    .map((log) => {
      const tokens = log.metadata?.tokensUsed as number | undefined;
      return tokens || 0;
    })
    .filter((t) => t > 0);
  const averageTokensUsed =
    tokenCounts.length > 0 ? tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length : 0;

  const brandGuidanceSuccessRate =
    brandGuidanceLogs.length > 0
      ? (brandGuidanceLogs.filter((log) => log.status === 'success').length /
          brandGuidanceLogs.length) *
        100
      : 0;

  // PDF processing statistics
  const pdfLogs = allLogs.filter(
    (log) => log.action === 'pdf_convert' || log.action === 'pdf_validate'
  );
  const pdfConversions = allLogs.filter((log) => log.action === 'pdf_convert').length;
  const pdfValidations = allLogs.filter((log) => log.action === 'pdf_validate').length;
  const pdfDurations = pdfLogs
    .map((log) => log.duration)
    .filter((d) => d !== undefined && d > 0) as number[];
  const averageProcessingTime =
    pdfDurations.length > 0 ? pdfDurations.reduce((a, b) => a + b, 0) / pdfDurations.length : 0;

  // User statistics
  const userIds = new Set(allLogs.map((log) => log.userId).filter((id) => id !== undefined));
  const uniqueUsers = userIds.size;

  const userRequestCounts = new Map<string, number>();
  allLogs.forEach((log) => {
    if (log.userId) {
      userRequestCounts.set(log.userId, (userRequestCounts.get(log.userId) || 0) + 1);
    }
  });
  const activeUsers = Array.from(userRequestCounts.values()).filter((count) => count > 5).length;

  return {
    date: new Date().toISOString(),
    summary: {
      totalRequests,
      successRate: Math.round(successRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime)
    },
    endpoints,
    compliance: {
      totalScans: complianceLogs.length,
      averageWcagScore: Math.round(averageWcagScore * 100) / 100,
      violationsByType
    },
    brandGuidance: {
      totalRequests: brandGuidanceLogs.length,
      averageTokensUsed: Math.round(averageTokensUsed),
      successRate: Math.round(brandGuidanceSuccessRate * 100) / 100
    },
    pdfProcessing: {
      totalConversions: pdfConversions,
      totalValidations: pdfValidations,
      averageProcessingTime: Math.round(averageProcessingTime)
    },
    users: {
      uniqueUsers,
      activeUsers
    }
  };
}

/**
 * Generate daily summary markdown report
 */
export function generateDailySummaryMarkdown(report: AnalyticsReport): string {
  const date = new Date(report.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `# Daily Analytics Summary - ${date}

## Overview

- **Total Requests:** ${report.summary.totalRequests}
- **Success Rate:** ${report.summary.successRate}%
- **Error Rate:** ${report.summary.errorRate}%
- **Average Response Time:** ${report.summary.averageResponseTime}ms

## Endpoint Statistics

| Endpoint | Requests | Success | Errors | Avg Duration (ms) |
|----------|----------|---------|--------|-------------------|
${report.endpoints
  .map(
    (e) =>
      `| ${e.endpoint} | ${e.requestCount} | ${e.successCount} | ${e.errorCount} | ${Math.round(e.averageDuration)} |`
  )
  .join('\n')}

## Compliance

- **Total Scans:** ${report.compliance.totalScans}
- **Average WCAG Score:** ${report.compliance.averageWcagScore}/100

### Violation Types

${Object.entries(report.compliance.violationsByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## Brand Guidance

- **Total Requests:** ${report.brandGuidance.totalRequests}
- **Average Tokens Used:** ${report.brandGuidance.averageTokensUsed}
- **Success Rate:** ${report.brandGuidance.successRate}%

## PDF Processing

- **Conversions:** ${report.pdfProcessing.totalConversions}
- **Validations:** ${report.pdfProcessing.totalValidations}
- **Average Processing Time:** ${report.pdfProcessing.averageProcessingTime}ms

## User Activity

- **Unique Users:** ${report.users.uniqueUsers}
- **Active Users (>5 requests):** ${report.users.activeUsers}

---

*Report generated at ${report.date}*
`;
}
