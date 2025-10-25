# Component Boundaries

## Packages & Responsibilities

- **packages/addins-word**
  - Responsibility: Apply MHP styles to Word documents, manage document protections, accessibility checks, and PDF export orchestration.
  - API Surface: Office.js commands (`Apply Brand`, `Fix Accessibility`, `Export to PDF`), background taskpane services, messaging bridge to shared-brand-core for Graph/bootstrap requests.
- **packages/addins-ppt**
  - Responsibility: Synchronize official slide masters, enforce layout/tag governance, accessibility remediation, and undoable fix actions.
  - API Surface: Office.js ribbon commands (`Apply Brand`, `Fix Accessibility`), slide inspection utilities exported for automated tests, event bus hooks consumed by shared-ui components.
- **packages/addins-outlook**
  - Responsibility: On-send compliance checks, signature/disclaimer injection, policy override workflow, telemetry emission.
  - API Surface: OnMessageSend event handler, settings taskpane (React components from shared-ui), outbound logging via shared-brand-core telemetry helpers.
- **packages/shared-brand-core**
  - Responsibility: Cross-host business logic (Graph client, feature flag reader, telemetry, caching, PDF helpers, AI routing guardrails).
  - API Surface: TypeScript modules exporting GraphClient, TemplateCache, PDFExportCoordinator, AIRewriteGuard; configuration loader that validates against `config/inputs.schema.json`.
- **packages/shared-ui**
  - Responsibility: Brand-aligned UI kit, accessibility primitives, IndexedDB-backed preference storage, i18n layer.
  - API Surface: React components (Button, Toast, ProgressBar, Panel, Wizard, Tooltip, Modal, Toggle, Dropdown, Tag, TemplatePicker), hooks for focus management and motion preferences, tokenized theme generator.
- **packages/backend-functions**
  - Responsibility: Azure Functions host for Templates, PDF, AI, Graph Proxy services with shared middleware for auth, telemetry, and policy checks.
  - API Surface: HTTP-triggered functions (`GET /templates`, `POST /pdf/convertA`, `POST /pdf/validate`, `POST /ai/rewrite`, `POST /graph/proxy`), default export per function module.

## Data Flows & PHI/PII Handling

- **Authentication**: All add-ins attempt Entra ID SSO via Nested App Authentication. Tokens are exchanged with backend-functions via HTTPS; sensitive tokens stay within Azure.
- **Templates**: Word/PowerPoint call `GET /templates` → Graph delta sync via Graph Proxy → SharePoint Org Assets. No PHI transmitted; template metadata cached in-memory server-side and IndexedDB client-side (`mhp_brand_templates`).
- **PDF Export**: Primary path (`Office context.document.getFileAsync('pdf')`) keeps PHI on-device. Fallback posts document content to `POST /pdf/convertA`; service logs only request metadata (size, correlation ID) with all content discarded after conversion.
- **AI Rewrite**: Outlook (and future clients) send redacted text when `piiMode=true`. Backend rejects non-Azure routing when PHI flag is set. Logs capture token counts and latency only.
- **Telemetry**: Events (`brand_apply`, `ppt_fix`, `outlook_onsend_action`, `pdf_export`, `ai_rewrite`) hash tenant/user identifiers and exclude payload content. App Insights ingestion occurs only via Azure-managed channel.
- **Policy Checks**: Outlook On-send inspects recipient domains and keyword matches locally. Only sanitized summaries and correlation IDs are stored server-side.

PHI/PII sensitive touch points are limited to:

- Outlook draft body & attachments before policy enforcement.
- Optional PDF conversion payloads.
- AI rewrite requests when `piiMode=true` (must remain in Azure).

## Content Security Policy (Task Panes)

Taskpane pages served from `apps/dev-host` enforce CSP headers:

- `default-src 'self' https://*.officeapps.live.com https://*.microsoftonline.com` (Office runtime + AAD)
- `script-src 'self' 'nonce-{runtime}' https://*.officeapps.live.com`
- `style-src 'self' 'unsafe-inline'` (only if nonce is not available for dynamic styles; otherwise prefer nonce-based injection)
- `img-src 'self' data: https://{cdnHost} https://*.sharepoint.com`
- `connect-src 'self' https://*.officeapps.live.com https://login.microsoftonline.com https://graph.microsoft.com https://{azureEndpoints}`
- `font-src 'self' data:`
- `frame-ancestors 'self' https://*.officeapps.live.com`
  Inline scripts are disallowed except for Office initialize shims with CSP nonces.

## Offline Behavior & Caching

- **IndexedDB Databases**
  - `mhp_ui`: stores `tour_completed`, color-contrast preferences, and last-run accessibility reports.
  - `mhp_brand_templates`: caches template metadata `{id, name, type, etag, lastSynced}` for offline browsing; synchronizes when back online using Graph delta links.
  - `mhp_pdf_snapshots`: retains pre/post apply-brand OOXML snapshots for Word undo previews (keyed by documentId + timestamp, max 3 entries).
- **Service Workers**
  - Deferred until tooling scaffold; planned to precache static assets for `apps/dev-host` with conservative cache busting.
- **Retry Queues**
  - Shared-brand-core GraphClient queues write operations when offline, replaying with exponential backoff once connectivity resumes.
- **Telemetry Buffer**
  - Telemetry events persist in `localStorage` under `mhp_telemetry_queue` until flushed; payloads exclude PHI and expire after 24h.

Offline UI signage clearly communicates read-only limitations when backend calls fail; accessible to screen readers via shared-ui status region.
