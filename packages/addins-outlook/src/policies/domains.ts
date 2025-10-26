import type { PolicyOptions, PolicyCheckContext } from '../types';

export function partitionRecipients(
  recipients: string[],
  allowedDomains: string[]
): { internal: string[]; external: string[] } {
  const normalizedAllowed = allowedDomains.map((domain) => domain.toLowerCase());
  const internal: string[] = [];
  const external: string[] = [];

  recipients.forEach((address) => {
    const domain = address.split('@')[1]?.toLowerCase() ?? '';
    if (normalizedAllowed.includes(domain)) {
      internal.push(address);
    } else {
      external.push(address);
    }
  });

  return { internal, external };
}

export function buildPolicyContext(
  mailbox: Office.MessageCompose,
  recipients: string[],
  options: PolicyOptions
): PolicyCheckContext {
  const { internal, external } = partitionRecipients(recipients, options.allowedDomains);
  return {
    mailbox,
    recipients,
    internalRecipients: internal,
    externalRecipients: external
  };
}
