import { app } from '@azure/functions';

import { agentsAdaptiveHttpTrigger } from './agents/httpTrigger';
import { rewriteHttpTrigger } from './ai/httpTrigger';
import { promptTuneHttpTrigger } from './ai/promptTuneHttpTrigger';
import { benchmarkHttpTrigger } from './analytics/benchmarkHttpTrigger';
import { clientSuccessHttpTrigger } from './analytics/clientSuccessHttpTrigger';
import { analyticsReportHttpTrigger } from './analytics/httpTrigger';
import { analyticsPredictHttpTrigger } from './analytics/predictiveHttpTrigger';
import { audioHttpTrigger } from './audio/audioHttpTrigger';
import { audioSummaryHttpTrigger } from './audio/httpTrigger';
import { auditEvidenceHttpTrigger } from './audit/evidenceHttpTrigger';
import { authValidateHttpTrigger } from './auth/httpTrigger';
import { billingSummaryHttpTrigger } from './billing/httpTrigger';
import { brandQAHttpTrigger } from './brand/qaHttpTrigger';
import { brandGuidanceAgentHttpTrigger } from './brandguidanceagent/httpTrigger';
import { briefsWorkflowHttpTrigger } from './briefs/httpTrigger';
import { collabSessionHttpTrigger } from './collaboration/httpTrigger';
import { complianceDashboardHttpTrigger } from './compliance/dashboardHttpTrigger';
import { complianceLabelHttpTrigger } from './compliance/dlpHttpTrigger';
import { complianceValidateHttpTrigger } from './compliance/httpTrigger';
import { complianceRealtimeHttpTrigger } from './compliance/realtimeHttpTrigger';
import { configHttpTrigger } from './config/httpTrigger';
import { costSummaryHttpTrigger } from './cost/httpTrigger';
import { dataLogsHttpTrigger, dataTemplatesHttpTrigger } from './data/httpTrigger';
import { ethicsDashboardHttpTrigger } from './ethics/ethicsHttpTrigger';
import { ethicsCheckHttpTrigger } from './ethics/httpTrigger';
import { experimentsReportHttpTrigger } from './experiments/httpTrigger';
import { fundingPredictHttpTrigger } from './funding/httpTrigger';
import { gammaExportHttpTrigger } from './gamma/httpTrigger';
import { graphQueryHttpTrigger } from './graph/httpTrigger';
import { redteamRunHttpTrigger } from './guardrails/httpTrigger';
import { healthHttpTrigger } from './health/httpTrigger';
import { i18nDetectHttpTrigger } from './i18n/httpTrigger';
import { knowledgeQueryHttpTrigger } from './knowledge/httpTrigger';
import { faqSearchHttpTrigger } from './knowledgebase/httpTrigger';
import { learningFeedbackHttpTrigger } from './learning/httpTrigger';
import { legislationTrackHttpTrigger } from './legislation/httpTrigger';
import { mediaAssembleHttpTrigger } from './media/httpTrigger';
import { memoryConversationHttpTrigger } from './memory/httpTrigger';
import { narrativesComposeHttpTrigger } from './narratives/httpTrigger';
import { notifySendHttpTrigger } from './notifications/httpTrigger';
import { orchestrationHttpTrigger } from './orchestration/httpTrigger';
import { convertPdfAHttpTrigger } from './pdf/convertA';
import { validatePdfHttpTrigger } from './pdf/validate';
import { platformOverviewHttpTrigger } from './platform/httpTrigger';
import { policyBriefHttpTrigger } from './policybrief/httpTrigger';
import { privacyDeleteHttpTrigger, privacyExportHttpTrigger } from './privacy/httpTrigger';
import { regulationDraftHttpTrigger } from './regulation/httpTrigger';
import { executiveDeckHttpTrigger } from './reports/executiveDeckHttpTrigger';
import { reportsGenerateHttpTrigger } from './reports/httpTrigger';
import { riskScanHttpTrigger } from './risk/httpTrigger';
import { scheduleReportHttpTrigger } from './scheduler/httpTrigger';
import { brandSearchHttpTrigger } from './search/httpTrigger';
import { semanticSearchHttpTrigger } from './search/semanticHttpTrigger';
import { storageDownloadHttpTrigger, storageUploadHttpTrigger } from './storage/httpTrigger';
import { subscriptionsHttpTrigger } from './subscriptions/httpTrigger';
import { supportTicketHttpTrigger } from './support/httpTrigger';
import { systemStatusHttpTrigger } from './system/httpTrigger';
import { versionHttpTrigger } from './system/versionHttpTrigger';
import { taggingExtractHttpTrigger } from './tagging/httpTrigger';
import { taggingSemanticHttpTrigger } from './tagging/semanticHttpTrigger';
import { templatesHttpTrigger } from './templates/httpTrigger';
import { tenantsConfigHttpTrigger, tenantsListHttpTrigger } from './tenants/httpTrigger';
import { translateHttpTrigger } from './translation/httpTrigger';
import { usersAddHttpTrigger, usersListHttpTrigger } from './users/httpTrigger';
import { videoAnnotateHttpTrigger } from './video/httpTrigger';
import { visualsChartHttpTrigger } from './visuals/httpTrigger';

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

// Gamma export endpoint
app.http('gammaExport', {
  methods: ['POST'],
  route: 'api/gamma/export',
  authLevel: 'anonymous', // Auth checked in handler
  handler: gammaExportHttpTrigger
});

// Reports generation endpoint
app.http('reportsGenerate', {
  methods: ['POST'],
  route: 'api/reports/generate',
  authLevel: 'anonymous', // Auth checked in handler
  handler: reportsGenerateHttpTrigger
});

// Visuals/chart endpoint
app.http('visualsChart', {
  methods: ['POST'],
  route: 'api/visuals/chart',
  authLevel: 'anonymous', // Auth checked in handler
  handler: visualsChartHttpTrigger
});

// Policy briefs workflow endpoints
app.http('briefsWorkflow', {
  methods: ['POST'],
  route: 'api/briefs/{action}',
  authLevel: 'anonymous', // Auth checked in handler
  handler: briefsWorkflowHttpTrigger
});

// Knowledge graph query endpoint
app.http('graphQuery', {
  methods: ['POST'],
  route: 'api/graph/query',
  authLevel: 'anonymous', // Auth checked in handler
  handler: graphQueryHttpTrigger
});

// Narrative composition endpoint
app.http('narrativesCompose', {
  methods: ['POST'],
  route: 'api/narratives/compose',
  authLevel: 'anonymous', // Auth checked in handler
  handler: narrativesComposeHttpTrigger
});

// Audio summary endpoint
app.http('audioSummary', {
  methods: ['POST'],
  route: 'api/audio/summary',
  authLevel: 'anonymous', // Auth checked in handler
  handler: audioSummaryHttpTrigger
});

// Media assembly endpoint
app.http('mediaAssemble', {
  methods: ['POST'],
  route: 'api/media/assemble',
  authLevel: 'anonymous', // Auth checked in handler
  handler: mediaAssembleHttpTrigger
});

// Scheduling endpoint
app.http('scheduleReport', {
  methods: ['POST'],
  route: 'api/schedule/report',
  authLevel: 'anonymous', // Auth checked in handler
  handler: scheduleReportHttpTrigger
});

// Tagging endpoint
app.http('taggingExtract', {
  methods: ['POST'],
  route: 'api/tagging/extract',
  authLevel: 'anonymous', // Auth checked in handler
  handler: taggingExtractHttpTrigger
});

// Translation endpoint
app.http('translate', {
  methods: ['POST'],
  route: 'api/translate',
  authLevel: 'anonymous', // Auth checked in handler
  handler: translateHttpTrigger
});

// Ethics check endpoint
app.http('ethicsCheck', {
  methods: ['POST'],
  route: 'api/ethics/check',
  authLevel: 'anonymous', // Auth checked in handler
  handler: ethicsCheckHttpTrigger
});

// Notifications endpoint
app.http('notifySend', {
  methods: ['POST'],
  route: 'api/notify/send',
  authLevel: 'anonymous', // Auth checked in handler
  handler: notifySendHttpTrigger
});

// Brand QA endpoint
app.http('brandQA', {
  methods: ['GET'],
  route: 'api/brand/qa',
  authLevel: 'anonymous', // Auth checked in handler
  handler: brandQAHttpTrigger
});

// Funding prediction endpoint
app.http('fundingPredict', {
  methods: ['POST'],
  route: 'api/funding/predict',
  authLevel: 'anonymous', // Auth checked in handler
  handler: fundingPredictHttpTrigger
});

// Legislation tracking endpoint
app.http('legislationTrack', {
  methods: ['POST'],
  route: 'api/legislation/track',
  authLevel: 'anonymous', // Auth checked in handler
  handler: legislationTrackHttpTrigger
});

// Compliance dashboard v2 endpoint
app.http('complianceDashboard', {
  methods: ['GET'],
  route: 'api/compliance/dashboard',
  authLevel: 'anonymous', // Auth checked in handler
  handler: complianceDashboardHttpTrigger
});

// Collaboration session endpoint
app.http('collabSession', {
  methods: ['POST'],
  route: 'api/collab/session',
  authLevel: 'anonymous', // Auth checked in handler
  handler: collabSessionHttpTrigger
});

// Semantic search endpoint
app.http('semanticSearch', {
  methods: ['POST'],
  route: 'api/search/query',
  authLevel: 'anonymous', // Auth checked in handler
  handler: semanticSearchHttpTrigger
});

// FAQ search endpoint
app.http('faqSearch', {
  methods: ['POST'],
  route: 'api/faq/search',
  authLevel: 'anonymous', // Auth checked in handler
  handler: faqSearchHttpTrigger
});

// Real-time compliance endpoint (Presidio + MIP)
app.http('complianceRealtime', {
  methods: ['POST'],
  route: 'api/compliance/realtime',
  authLevel: 'anonymous', // Auth checked in handler
  handler: complianceRealtimeHttpTrigger
});

// Configuration service endpoint
app.http('config', {
  methods: ['GET', 'PUT'],
  route: 'api/config',
  authLevel: 'anonymous', // Auth checked in handler
  handler: configHttpTrigger
});

// Knowledge graph query endpoint
app.http('knowledgeQuery', {
  methods: ['POST'],
  route: 'api/knowledge/query',
  authLevel: 'anonymous', // Auth checked in handler
  handler: knowledgeQueryHttpTrigger
});

// Audit evidence pack endpoint
app.http('auditEvidence', {
  methods: ['POST'],
  route: 'api/audit/evidence',
  authLevel: 'anonymous', // Auth checked in handler
  handler: auditEvidenceHttpTrigger
});

// Prompt tuning endpoint
app.http('promptTune', {
  methods: ['POST'],
  route: 'api/prompts/tune',
  authLevel: 'anonymous', // Auth checked in handler
  handler: promptTuneHttpTrigger
});

// Conversational memory endpoint
app.http('memoryConversation', {
  methods: ['POST'],
  route: 'api/memory/conversation',
  authLevel: 'anonymous', // Auth checked in handler
  handler: memoryConversationHttpTrigger
});

// Predictive maintenance analytics endpoint
app.http('analyticsPredict', {
  methods: ['GET'],
  route: 'api/analytics/predict',
  authLevel: 'anonymous', // Auth checked in handler
  handler: analyticsPredictHttpTrigger
});

// Risk scanner endpoint
app.http('riskScan', {
  methods: ['POST'],
  route: 'api/risk/scan',
  authLevel: 'anonymous', // Auth checked in handler
  handler: riskScanHttpTrigger
});

// Audio generation/transcription endpoints
app.http('audioGenerate', {
  methods: ['POST'],
  route: 'api/audio/{action}',
  authLevel: 'anonymous', // Auth checked in handler
  handler: audioHttpTrigger
});

// Video annotation endpoint
app.http('videoAnnotate', {
  methods: ['POST'],
  route: 'api/video/annotate',
  authLevel: 'anonymous', // Auth checked in handler
  handler: videoAnnotateHttpTrigger
});

// Orchestration endpoint
app.http('orchestration', {
  methods: ['GET', 'POST'],
  route: 'api/orchestration/workflow',
  authLevel: 'anonymous', // Auth checked in handler
  handler: orchestrationHttpTrigger
});

// Semantic tagging endpoint
app.http('taggingSemantic', {
  methods: ['POST'],
  route: 'api/tagging/semantic',
  authLevel: 'anonymous', // Auth checked in handler
  handler: taggingSemanticHttpTrigger
});

// Client success analytics endpoint
app.http('clientSuccess', {
  methods: ['GET'],
  route: 'api/analytics/clientsuccess',
  authLevel: 'anonymous', // Auth checked in handler
  handler: clientSuccessHttpTrigger
});

// Regulatory writing endpoint
app.http('regulationDraft', {
  methods: ['POST'],
  route: 'api/regulation/draft',
  authLevel: 'anonymous', // Auth checked in handler
  handler: regulationDraftHttpTrigger
});

// Ethics board dashboard endpoint
app.http('ethicsDashboard', {
  methods: ['GET'],
  route: 'api/ethics/dashboard',
  authLevel: 'anonymous', // Auth checked in handler
  handler: ethicsDashboardHttpTrigger
});

// Benchmarking endpoint
app.http('benchmark', {
  methods: ['POST'],
  route: 'api/analytics/benchmark',
  authLevel: 'anonymous', // Auth checked in handler
  handler: benchmarkHttpTrigger
});

// Executive deck generation endpoint
app.http('executiveDeck', {
  methods: ['POST'],
  route: 'api/reports/executivedeck',
  authLevel: 'anonymous', // Auth checked in handler
  handler: executiveDeckHttpTrigger
});

// Support ticketing endpoint
app.http('supportTicket', {
  methods: ['POST'],
  route: 'api/support/ticket',
  authLevel: 'anonymous', // Auth checked in handler
  handler: supportTicketHttpTrigger
});

// Billing summary endpoint
app.http('billingSummary', {
  methods: ['GET'],
  route: 'api/billing/summary',
  authLevel: 'anonymous', // Auth checked in handler
  handler: billingSummaryHttpTrigger
});

// Continuous learning feedback endpoint
app.http('learningFeedback', {
  methods: ['POST'],
  route: 'api/learning/feedback',
  authLevel: 'anonymous', // Auth checked in handler
  handler: learningFeedbackHttpTrigger
});

// Adaptive learning agents endpoint
app.http('agentsAdaptive', {
  methods: ['POST'],
  route: 'api/agents/adaptive',
  authLevel: 'anonymous', // Auth checked in handler
  handler: agentsAdaptiveHttpTrigger
});

// Platform architecture overview endpoint
app.http('platformOverview', {
  methods: ['GET'],
  route: 'api/platform/overview',
  authLevel: 'anonymous', // Auth checked in handler
  handler: platformOverviewHttpTrigger
});

// Subscriptions endpoint
app.http('subscriptions', {
  methods: ['GET', 'POST', 'DELETE'],
  route: 'api/subscriptions/{*subId}',
  authLevel: 'anonymous', // Auth checked in handler
  handler: subscriptionsHttpTrigger
});

// Import nightly compliance job to register timer
import './compliance/nightlyComplianceJob';
// Import secret rotation job to register timer
import './secrets/rotationJob';
// Import weekly self-audit job to register timer
import './system/selfAuditJob';
// Import nightly confidence run job to register timer
import './system/confidenceJob';
