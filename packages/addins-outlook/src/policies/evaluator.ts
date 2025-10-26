import type { PolicyDecision, PolicyIssue, PolicyOptions } from '../types';

import { buildPolicyContext } from './domains';
import { summarizePolicy } from './keywords';

export function evaluatePolicy(
  mailbox: Office.MessageCompose,
  recipients: string[],
  bodyPreview: string,
  options: PolicyOptions
): PolicyDecision {
  const context = buildPolicyContext(mailbox, recipients, options);
  context.bodyPreview = bodyPreview;

  const issues: PolicyIssue[] = summarizePolicy(context, options);

  const hasBlocker = issues.some((issue) => issue.severity === 'block');
  const requiresJustification =
    context.externalRecipients.length > 0 || issues.some((issue) => issue.severity === 'warning');

  return {
    allowSend: !hasBlocker,
    requiresJustification,
    issues,
    context
  };
}
