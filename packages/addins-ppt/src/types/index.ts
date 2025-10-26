import 'office-js';

export interface MasterLayoutDefinition {
  id: string;
  name: string;
  tagConventions: Record<string, string>;
}

export interface BrandMasterConfig {
  version: string;
  masters: MasterLayoutDefinition[];
}

export interface SlideIssue {
  slideIndex: number;
  issueId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  tag?: string;
}

export interface SlideFixResult {
  slideIndex: number;
  issueId: string;
  status: 'fixed' | 'skipped' | 'failed';
  message?: string;
}

export interface DeckAuditResult {
  issues: SlideIssue[];
  thumbnails?: string[];
}

export interface FixOptions {
  fixAll?: boolean;
}

export interface TemplateSyncResult {
  appliedMasterId?: string;
  appliedLayoutId?: string;
  message?: string;
}

export interface UndoSnapshot {
  id: string;
  createdAt: string;
  deckId: string;
  data: string;
}
