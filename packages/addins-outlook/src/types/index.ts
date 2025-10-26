import 'office-js';

export interface PolicyCheckContext {
  mailbox: Office.MessageCompose;
  recipients: string[];
  externalRecipients: string[];
  internalRecipients: string[];
  bodyPreview?: string;
}

export interface PolicyIssue {
  id: string;
  severity: 'info' | 'warning' | 'block';
  description: string;
}

export interface PolicyDecision {
  allowSend: boolean;
  requiresJustification: boolean;
  issues: PolicyIssue[];
  justification?: string;
  context: PolicyCheckContext;
}

export interface DisclaimerConfig {
  externalBannerHtml: string;
  legalDisclaimerHtml: string;
}

export interface SignatureConfig {
  personaId: string;
  html: string;
}

export interface PolicyOptions {
  allowedDomains: string[];
  redFlagKeywords: string[];
  hardBlockKeywords: string[];
}

export interface OnSendResult {
  allowSend: boolean;
  errorMessage?: string;
}
