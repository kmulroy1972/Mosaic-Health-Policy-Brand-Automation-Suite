import { app } from '@azure/functions';

import { rewriteHttpTrigger } from './ai/httpTrigger';
import { analyticsReportHttpTrigger } from './analytics/httpTrigger';
import { authValidateHttpTrigger } from './auth/httpTrigger';
import { brandGuidanceAgentHttpTrigger } from './brandguidanceagent/httpTrigger';
import { complianceLabelHttpTrigger } from './compliance/dlpHttpTrigger';
import { complianceValidateHttpTrigger } from './compliance/httpTrigger';
import { costSummaryHttpTrigger } from './cost/httpTrigger';
import { dataLogsHttpTrigger, dataTemplatesHttpTrigger } from './data/httpTrigger';
import { experimentsReportHttpTrigger } from './experiments/httpTrigger';
import { redteamRunHttpTrigger } from './guardrails/httpTrigger';
import { healthHttpTrigger } from './health/httpTrigger';
import { i18nDetectHttpTrigger } from './i18n/httpTrigger';
import { convertPdfAHttpTrigger } from './pdf/convertA';
import { validatePdfHttpTrigger } from './pdf/validate';
import { policyBriefHttpTrigger } from './policybrief/httpTrigger';
import { privacyDeleteHttpTrigger, privacyExportHttpTrigger } from './privacy/httpTrigger';
import { brandSearchHttpTrigger } from './search/httpTrigger';
import { storageDownloadHttpTrigger, storageUploadHttpTrigger } from './storage/httpTrigger';
import { systemStatusHttpTrigger } from './system/httpTrigger';
import { versionHttpTrigger } from './system/versionHttpTrigger';
import { templatesHttpTrigger } from './templates/httpTrigger';
import { tenantsConfigHttpTrigger, tenantsListHttpTrigger } from './tenants/httpTrigger';
import { usersAddHttpTrigger, usersListHttpTrigger } from './users/httpTrigger';

// Health check endpoint
app.http('health', {
  methods: ['GET'],
  route: 'api/health',
  authLevel: 'anonymous',
  handler: healthHttpTrigger
});

// Templates endpoint
app.http('templates', {
  methods: ['GET'],
  route: 'api/templates',
  authLevel: 'anonymous',
  handler: templatesHttpTrigger
});

// AI rewrite endpoint
app.http('rewrite', {
  methods: ['POST'],
  route: 'api/rewrite',
  authLevel: 'anonymous',
  handler: rewriteHttpTrigger
});

// PDF conversion endpoint
app.http('convertPdfA', {
  methods: ['POST'],
  route: 'api/pdf/convert',
  authLevel: 'anonymous',
  handler: convertPdfAHttpTrigger
});

// PDF validation endpoint
app.http('validatePdf', {
  methods: ['POST'],
  route: 'api/pdf/validate',
  authLevel: 'anonymous',
  handler: validatePdfHttpTrigger
});

// Brand guidance agent endpoint
app.http('brandguidanceagent', {
  methods: ['POST'],
  route: 'api/brandguidanceagent',
  authLevel: 'anonymous',
  handler: brandGuidanceAgentHttpTrigger
});

// Compliance validation endpoint
app.http('complianceValidate', {
  methods: ['POST'],
  route: 'api/compliance/validate',
  authLevel: 'anonymous',
  handler: complianceValidateHttpTrigger
});

// Authentication validation endpoint
app.http('authValidate', {
  methods: ['GET', 'POST'],
  route: 'api/auth/validate',
  authLevel: 'anonymous', // Allow anonymous to validate tokens
  handler: authValidateHttpTrigger
});

// Data persistence endpoints
app.http('dataLogs', {
  methods: ['GET'],
  route: 'api/data/logs',
  authLevel: 'anonymous',
  handler: dataLogsHttpTrigger
});

app.http('dataTemplates', {
  methods: ['GET', 'POST'],
  route: 'api/data/templates',
  authLevel: 'anonymous',
  handler: dataTemplatesHttpTrigger
});

// Storage endpoints
app.http('storageUpload', {
  methods: ['POST'],
  route: 'api/storage/upload',
  authLevel: 'anonymous', // Auth checked in handler
  handler: storageUploadHttpTrigger
});

app.http('storageDownload', {
  methods: ['GET'],
  route: 'api/storage/download',
  authLevel: 'anonymous', // Auth checked in handler
  handler: storageDownloadHttpTrigger
});

// Analytics endpoint
app.http('analyticsReport', {
  methods: ['GET'],
  route: 'api/analytics/report',
  authLevel: 'anonymous',
  handler: analyticsReportHttpTrigger
});

// System status endpoint
app.http('systemStatus', {
  methods: ['GET'],
  route: 'api/system/status',
  authLevel: 'anonymous',
  handler: systemStatusHttpTrigger
});

// i18n endpoint
app.http('i18nDetect', {
  methods: ['GET'],
  route: 'api/i18n/detect',
  authLevel: 'anonymous',
  handler: i18nDetectHttpTrigger
});

// User management endpoints
app.http('usersList', {
  methods: ['GET'],
  route: 'api/users/list',
  authLevel: 'anonymous', // Auth checked in handler
  handler: usersListHttpTrigger
});

app.http('usersAdd', {
  methods: ['POST'],
  route: 'api/users/add',
  authLevel: 'anonymous', // Auth checked in handler
  handler: usersAddHttpTrigger
});

// Version endpoint
app.http('version', {
  methods: ['GET'],
  route: 'api/version',
  authLevel: 'anonymous',
  handler: versionHttpTrigger
});

// Policy brief endpoint
app.http('policyBrief', {
  methods: ['POST'],
  route: 'api/policybrief',
  authLevel: 'anonymous', // Auth checked in handler
  handler: policyBriefHttpTrigger
});

// Cost summary endpoint
app.http('costSummary', {
  methods: ['GET'],
  route: 'api/cost/summary',
  authLevel: 'anonymous', // Auth checked in handler
  handler: costSummaryHttpTrigger
});

// Privacy endpoints
app.http('privacyExport', {
  methods: ['GET'],
  route: 'api/privacy/export',
  authLevel: 'anonymous', // Auth checked in handler
  handler: privacyExportHttpTrigger
});

app.http('privacyDelete', {
  methods: ['DELETE'],
  route: 'api/privacy/delete',
  authLevel: 'anonymous', // Auth checked in handler
  handler: privacyDeleteHttpTrigger
});

// Tenant management endpoints
app.http('tenantsList', {
  methods: ['GET'],
  route: 'api/tenants/list',
  authLevel: 'anonymous', // Auth checked in handler
  handler: tenantsListHttpTrigger
});

app.http('tenantsConfig', {
  methods: ['GET'],
  route: 'api/tenants/config',
  authLevel: 'anonymous', // Auth checked in handler
  handler: tenantsConfigHttpTrigger
});

// DLP/MIP labeling endpoint
app.http('complianceLabel', {
  methods: ['POST'],
  route: 'api/compliance/label',
  authLevel: 'anonymous', // Auth checked in handler
  handler: complianceLabelHttpTrigger
});

// Brand search endpoint
app.http('brandSearch', {
  methods: ['GET'],
  route: 'api/brand/search',
  authLevel: 'anonymous', // Auth checked in handler
  handler: brandSearchHttpTrigger
});

// Experiments endpoint
app.http('experimentsReport', {
  methods: ['GET'],
  route: 'api/experiments/report',
  authLevel: 'anonymous', // Auth checked in handler
  handler: experimentsReportHttpTrigger
});

// Red team endpoint
app.http('redteamRun', {
  methods: ['POST'],
  route: 'api/redteam/run',
  authLevel: 'anonymous', // Auth checked in handler
  handler: redteamRunHttpTrigger
});

// Import nightly compliance job to register timer
import './compliance/nightlyComplianceJob';
// Import secret rotation job to register timer
import './secrets/rotationJob';
// Import weekly self-audit job to register timer
import './system/selfAuditJob';
// Import nightly confidence run job to register timer
import './system/confidenceJob';
