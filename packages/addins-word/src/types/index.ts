import 'office-js';

export type RequirementSet = 'WordApi1.3' | 'WordApi1.5' | 'WordApi1.7';

export interface BrandStyles {
  name: string;
  paragraphs: string[];
  characters: string[];
}

export interface BrandManifest {
  version: string;
  appliedAt: string;
}

export interface BrandContext {
  requirementSet: RequirementSet;
  styles: BrandStyles;
  hasOrgAssets: boolean;
}

export interface AltTextIssue {
  id: string;
  description: string;
  target: Word.InlinePicture | Word.Shape;
}

export interface AltTextAssessmentResult {
  missing: AltTextIssue[];
  fixed: AltTextIssue[];
}

export interface ApplyBrandOptions {
  skipHeaders?: boolean;
  skipFooters?: boolean;
  previewOnly?: boolean;
}

export interface ApplyBrandResult {
  success: boolean;
  issues?: AltTextAssessmentResult;
  manifest?: BrandManifest;
  message?: string;
}

export interface UndoSnapshot {
  id: string;
  createdAt: string;
  documentId: string;
  data: string;
}
