/**
 * Data models for Cosmos DB persistence
 */

/**
 * Audit log entry for tracking operations
 */
export interface AuditLog {
  id: string; // Cosmos DB document ID
  timestamp: string; // ISO 8601 timestamp
  userId?: string; // User ID from authentication
  tenantId?: string; // Tenant ID for multi-tenant support
  action: string; // Action performed (e.g., 'rewrite', 'validate_pdf', 'template_access')
  resourceType: string; // Type of resource (e.g., 'document', 'template', 'compliance_report')
  resourceId?: string; // ID of the resource affected
  status: 'success' | 'error' | 'warning'; // Operation status
  duration?: number; // Duration in milliseconds
  metadata?: Record<string, unknown>; // Additional metadata
  correlationId?: string; // Correlation ID for distributed tracing
  traceId?: string; // OpenTelemetry trace ID
}

/**
 * Template metadata stored in Cosmos DB
 */
export interface TemplateMetadata {
  id: string; // Template ID (from Graph API or generated)
  name: string; // Template display name
  description?: string; // Template description
  category?: string; // Template category
  source: 'graph' | 'manual' | 'import'; // Template source
  sourceId?: string; // ID from source system (e.g., SharePoint item ID)
  lastModified: string; // ISO 8601 timestamp
  created: string; // ISO 8601 timestamp
  version?: string; // Template version
  tags?: string[]; // Template tags
  metadata?: Record<string, unknown>; // Additional metadata
  tenantId?: string; // Tenant ID for multi-tenant support
}

/**
 * User preferences stored in Cosmos DB
 */
export interface UserPreferences {
  id: string; // User ID (from authentication)
  tenantId?: string; // Tenant ID
  preferences: {
    language?: string; // Preferred language (en, es, fr, pt)
    theme?: 'light' | 'dark' | 'auto'; // UI theme preference
    defaultTemplate?: string; // Default template ID
    brandGuidanceMode?: 'strict' | 'moderate' | 'lenient'; // Brand guidance strictness
    notificationSettings?: {
      email?: boolean;
      teams?: boolean;
      complianceAlerts?: boolean;
    };
    accessibility?: {
      highContrast?: boolean;
      screenReader?: boolean;
    };
  };
  lastModified: string; // ISO 8601 timestamp
  metadata?: Record<string, unknown>; // Additional metadata
}

/**
 * Create a new audit log entry
 */
export function createAuditLog(
  action: string,
  resourceType: string,
  status: AuditLog['status'],
  options?: {
    userId?: string;
    tenantId?: string;
    resourceId?: string;
    duration?: number;
    metadata?: Record<string, unknown>;
    correlationId?: string;
    traceId?: string;
  }
): AuditLog {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: new Date().toISOString(),
    userId: options?.userId,
    tenantId: options?.tenantId,
    action,
    resourceType,
    resourceId: options?.resourceId,
    status,
    duration: options?.duration,
    metadata: options?.metadata,
    correlationId: options?.correlationId,
    traceId: options?.traceId
  };
}
