# Telemetry Schema

This document defines the telemetry events, sanitisation rules, and governance for the MHP Brand Automation suite. All instrumentation must respect the following privacy guardrails:

- Identifiers (`tenantHash`, `userHash`) **must** be generated with HMAC-SHA256 using an environment-specific salt via `hashIdentifier`.
- No raw document content, email addresses, SSNs, or URLs containing query parameters may be persisted. Use `sanitizeTelemetryAttributes` before emitting events.
- Feature flag state must be captured with each event to support diagnostics.

## Common Fields

| Field                                 | Type     | Description                                                        |
| ------------------------------------- | -------- | ------------------------------------------------------------------ |
| `timestamp`                           | datetime | UTC timestamp assigned by ingestion.                               |
| `eventName`                           | string   | Logical event name (see table below).                              |
| `tenantHash`                          | string   | HMAC-SHA256 of tenant ID; never log the raw tenant ID.             |
| `userHash`                            | string   | HMAC-SHA256 of user ID/Object ID.                                  |
| `host`                                | string   | `word`, `powerpoint`, `outlook`, or `backend`.                     |
| `elapsedMs`                           | number   | Operation duration in milliseconds.                                |
| `result`                              | string   | `success` or `failure`.                                            |
| `errorCategory`                       | string   | Optional taxonomy (`Throttled`, `Transient`, `Auth`, `Permanent`). |
| `correlationId`                       | string   | Optional cross-service correlation token (sanitised).              |
| `featureFlagSnapshot.enablePdfA`      | bool     | State of PDF/A feature flag when event fired.                      |
| `featureFlagSnapshot.allowNonAzureAI` | bool     | State of AI provider flag when event fired.                        |

## Event Catalogue

| Event                    | Emitted By              | Additional Fields                                                                                                                                      |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `brand_apply`            | Word add-in             | `stylePackageVersion`, `issues.missingAltText` (number), `issues.fixedAltText` (number).                                                               |
| `ppt_fix`                | PowerPoint add-in       | `slidesChecked`, `slidesFixed`, `contrastWarnings`, `layoutEnforced`.                                                                                  |
| `outlook_onsend_action`  | Outlook add-in          | `recipientCategory` (`internal`/`external`), `disclaimerAdded` (bool), `policyOutcome` (`allowed`/`blocked`/`override`), `overrideReason` (sanitised). |
| `pdf_export`             | Word/PowerPoint         | `pdfaSelected` (bool), `validationRequested` (bool), `validationOutcome` (`passed`/`warnings`/`failed`).                                               |
| `ai_rewrite`             | Shared UI / Word add-in | `piiMode` (bool), `modelId`, `promptTokens`, `completionTokens`.                                                                                       |
| `backend_templates_sync` | Azure Functions         | `itemsReturned`, `deltaApplied` (bool), `cacheHit` (bool), `errorCategory` (if failure).                                                               |
| `backend_pdf_convert`    | Azure Functions         | `convertMode` (`in-app`/`service`), `pdfa` (bool).                                                                                                     |
| `backend_pdf_validate`   | Azure Functions         | `pdfua.passed` (bool), `pdfa.passed` (bool).                                                                                                           |

> **Note:** `overrideReason` and similar free-text fields must be scrubbed before emission. Never store original user input.

## Error Taxonomy

All failures must be mapped to one of the following categories before ingestion:

- `Throttled`: HTTP 429 or circuit breaker open.
- `Transient`: Recoverable 5xx, network resets, or dependency timeouts.
- `Auth`: Authentication/authorisation failures (401/403).
- `Permanent`: Validation errors, unsupported operations, or user cancellations.

## Scrubbing & Hashing Helpers

- Use `sanitizeTelemetryAttributes` for any dynamic payloads.
- Use `hashIdentifier(value, salt)` (async) to derive tenant/user hashes.
- Use `sanitizeUrl` for URLs; query parameters and fragments are automatically stripped.

## Retention & Access Controls

- Application Insights retention: 30 days (configured in `config/inputs.json`).
- Access limited to the MHP engineering and compliance teams. Export to external systems requires privacy review.

## Metric Derivations

- **Adoption**: `brand_apply`, `ppt_fix`, `outlook_onsend_action`, `pdf_export` counts, unique tenant/user, and PDF/A selection rate.
- **Reliability**: Error rate by taxonomy, retry effectiveness, PDF validation outcomes, AI rewrite failures vs. successes.
- **Performance**: P50/P95 `elapsedMs` across key events, throttled request counts, delta sync duration.
