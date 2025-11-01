import { app } from '@azure/functions';

import { rewriteHttpTrigger } from './ai/httpTrigger';
import { analyticsReportHttpTrigger } from './analytics/httpTrigger';
import { authValidateHttpTrigger } from './auth/httpTrigger';
import { brandGuidanceAgentHttpTrigger } from './brandguidanceagent/httpTrigger';
import { complianceValidateHttpTrigger } from './compliance/httpTrigger';
import { dataLogsHttpTrigger, dataTemplatesHttpTrigger } from './data/httpTrigger';
import { healthHttpTrigger } from './health/httpTrigger';
import { convertPdfAHttpTrigger } from './pdf/convertA';
import { validatePdfHttpTrigger } from './pdf/validate';
import { storageDownloadHttpTrigger, storageUploadHttpTrigger } from './storage/httpTrigger';
import { templatesHttpTrigger } from './templates/httpTrigger';

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

// Import nightly compliance job to register timer
import './compliance/nightlyComplianceJob';
