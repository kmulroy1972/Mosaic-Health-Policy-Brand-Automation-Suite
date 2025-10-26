import type { PolicyCheckContext, PolicyIssue, PolicyOptions } from '../types';

export function evaluateKeywords(bodyPreview: string, options: PolicyOptions): PolicyIssue[] {
  const issues: PolicyIssue[] = [];
  const normalizedBody = bodyPreview.toLowerCase();

  options.hardBlockKeywords.forEach((keyword) => {
    if (normalizedBody.includes(keyword.toLowerCase())) {
      issues.push({
        id: `hard-block-${keyword}`,
        severity: 'block',
        description: `Message contains blocked term: ${keyword}`
      });
    }
  });

  options.redFlagKeywords.forEach((keyword) => {
    if (normalizedBody.includes(keyword.toLowerCase())) {
      issues.push({
        id: `warn-${keyword}`,
        severity: 'warning',
        description: `Message contains monitored term: ${keyword}`
      });
    }
  });

  return issues;
}

export function summarizePolicy(ctx: PolicyCheckContext, options: PolicyOptions): PolicyIssue[] {
  if (!ctx.bodyPreview) {
    return [];
  }
  return evaluateKeywords(ctx.bodyPreview, options);
}
