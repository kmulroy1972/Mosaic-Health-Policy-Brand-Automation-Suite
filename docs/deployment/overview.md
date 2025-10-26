# Deployment & Release Architecture

## Environments

| Environment | Purpose                      | Host                                                  | Manifests                    |
| ----------- | ---------------------------- | ----------------------------------------------------- | ---------------------------- |
| `dev`       | Internal QA, nightly builds. | Azure Static Web Apps (dev), Azure Functions dev slot | `manifest/unified.dev.json`  |
| `test`      | UAT with pilot users.        | Azure Blob + CDN (test), Functions staging slot       | `manifest/unified.test.json` |
| `prod`      | Production tenant rollout.   | Azure CDN (prod), Functions production slot           | `manifest/unified.prod.json` |

All environments share:

- Application Insights + Log Analytics workspace.
- App Configuration for feature flags (blue/green toggles).
- Key Vault storing client secrets, Graph credentials.
- Azure OpenAI resource (approved region) for AI rewrite.

## CI/CD Flow

1. **Build Stage** (pull request & main):
   - `pnpm verify` (lint, unit tests, tsc, manifest validation).
   - Playwright/axe smoke tests (CI flag `MHP_A11Y=true`).
   - Produce `dist/` bundles for each package via `pnpm build`.
2. **Package Artifacts**:
   - Zip task pane assets per host (`apps/dev-host`, `packages/shared-ui`).
   - Generate unified manifests with environment URLs.
   - Archive PDFs for validation reports.
3. **Deploy Stage**:
   - Triggered on `main` -> deploy to `dev` slot using Azure CLI scripts.
   - `test` deployments occur from `release/*` branches.
   - `prod` deployment occurs from GitHub Release tag.
4. **Verification**:
   - Smoke tests executed against deployed dev slot using Playwright + Azure Static Web Apps URL.
   - Telemetry event `deployment_validation` emitted.
5. **Promotion**:
   - `test` and `prod` use blue/green: staging slot swap after validation.

## Artifact Naming

- `artifacts/taskpane-word-dev.zip` – zipped Word assets for dev.
- `artifacts/backend-functions-dev.zip` – zipped Functions bundle (if not using Zip Deploy CI).
- `artifacts/manifest-unified-dev.xml` – Microsoft 365 unified manifest.
- `artifacts/pdf-reports/*.xml` – veraPDF validation outputs.
- `artifacts/storybook/` – static Storybook build (optional for design reviews).

## Rollback Strategy

- Maintain previous successful artifact set in GitHub Releases.
- Functions: swap staging slot back to previous production build.
- Static assets: re-point CDN to previous blob version (via versioned container in Azure Storage).
- App Configuration: toggle `featureFlags.allowNonAzureAI` and other kill switches to mitigate behavioural risks instantly.

## Telemetry Hooks

- Emit `deployment_validation` with attributes: `{ environment, result, elapsedMs, gitSha }`.
- Emit `deployment_rollout` after successful swap with `slot`, `durationMs`, `artifactVersion`.
- Alerts monitor error spike >2% per Step 13 to halt rollout.
