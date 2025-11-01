import { app } from '@azure/functions';

import { rewriteHttpTrigger } from './ai/httpTrigger';
import { brandGuidanceAgentHttpTrigger } from './brandguidanceagent/httpTrigger';
import { complianceValidateHttpTrigger } from './compliance/httpTrigger';
import { healthHttpTrigger } from './health/httpTrigger';
import { convertPdfAHttpTrigger } from './pdf/convertA';
import { validatePdfHttpTrigger } from './pdf/validate';
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

// Import nightly compliance job to register timer
import './compliance/nightlyComplianceJob';
