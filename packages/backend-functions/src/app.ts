import { app } from '@azure/functions';

import { rewriteHttpTrigger } from './ai/httpTrigger';
import { healthHttpTrigger } from './health/httpTrigger';
import { convertPdfAHttpTrigger } from './pdf/convertA';
import { validatePdfHttpTrigger } from './pdf/validate';
import { templatesHttpTrigger } from './templates/httpTrigger';

// Health check endpoint
app.http('health', {
  methods: ['GET'],
  route: 'health',
  authLevel: 'anonymous',
  handler: healthHttpTrigger
});

// Templates endpoint
app.http('templates', {
  methods: ['GET'],
  route: 'templates',
  authLevel: 'anonymous',
  handler: templatesHttpTrigger
});

// AI rewrite endpoint
app.http('rewrite', {
  methods: ['POST'],
  route: 'rewrite',
  authLevel: 'anonymous',
  handler: rewriteHttpTrigger
});

// PDF conversion endpoint
app.http('convertPdfA', {
  methods: ['POST'],
  route: 'pdf/convert',
  authLevel: 'anonymous',
  handler: convertPdfAHttpTrigger
});

// PDF validation endpoint
app.http('validatePdf', {
  methods: ['POST'],
  route: 'pdf/validate',
  authLevel: 'anonymous',
  handler: validatePdfHttpTrigger
});
