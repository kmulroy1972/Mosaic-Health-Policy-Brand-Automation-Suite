/**
 * Policy Brief data models
 */

export interface PolicyBrief {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedAt?: string;
  tenantId?: string;
}

export interface BriefWorkflowAction {
  action: 'create' | 'get' | 'approve' | 'publish';
  briefId?: string;
  brief?: Partial<PolicyBrief>;
}
