# Test Strategy & Harness Overview

This plan delivers the quality gates defined in Step 14. It ties each suite to an owner, runtime, and pass criteria so we can block regressions confidently.

## Test Stack Summary

| Suite           | Tooling                                         | Trigger                          | Purpose                                                                                          |
| --------------- | ----------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| Unit            | Jest (`pnpm test:unit`)                         | PR + pre-push                    | Validate shared utilities (`graphClient`, AI routing guards, feature-flag helpers).              |
| Integration     | Playwright (`pnpm test:integration`)            | Nightly + gated feature branches | Exercise Word/PPT task panes against mock Graph/AI hosts, verify offline queueing, wizard flows. |
| Accessibility   | jest-axe via Playwright (`pnpm test:a11y`)      | PR + nightly                     | Ensure task panes meet WCAG 2.1 AA (axe-core, keyboard traversal, focus traps).                  |
| Throttling      | Custom harness (`pnpm test:throttle`)           | Nightly                          | Stress Graph retry/circuit breaker logic using synthetic 429/503 sequences.                      |
| Offline         | Service worker simulation (`pnpm test:offline`) | Nightly                          | Guarantee user feedback/queue persists when network drops mid-operation.                         |
| PDF Validation  | veraPDF CLI (`pnpm test:pdf`)                   | Release build                    | Fail release if exported PDF/A-2b violates validator.                                            |
| Identity Matrix | Jest parameterised (`pnpm test:identity`)       | Nightly                          | Confirm NAA SSO handshake + OBO fallback scenarios.                                              |

## Environments & Data

- Unit tests run entirely in Node with fetch-mock; no secrets.
- Integration & a11y rely on the dev host app (`apps/dev-host`) served locally, with Playwright launching Chromium + Edge channels.
- Throttling harness spins up `tests/fixtures/throttle-server.ts` issuing programmable 429/Retry-After responses.
- Offline tests rely on Playwright network routing to drop requests mid-flow and inspect UI toasts/queues persisted in IndexedDB.
- PDF validation pulls sample exports produced by the Word automation harness, using `veraPDF-GUI` docker image (documented in `tests/pdf/README.md`).
- Identity tests stub Entra responses via `tests/fixtures/identityMock.ts` covering NAA available/unavailable toggles.

## Gates & Reporting

- CI `verify` job expands to run `pnpm test:unit` and `pnpm test:a11y`; nightly pipeline executes the full matrix.
- Results surface via GitHub Action summaries and Application Insights custom events (`test_suite_result`) for trend tracking.
- Failures must include sanitised telemetry payloads and captured artefacts (screenshots, axe reports, veraPDF XML) stored in the build artefact feed.

## Maintenance

- Owners: Shared platform team maintains harness; feature pods own spec files under their domain (`word`, `ppt`, `outlook`, `backend`).
- Tests live alongside fixtures in `/tests`, favour TypeScript for parity with product code.
- Linting/formatting use repo defaults (ESLint/Prettier) via `pnpm test:lint` pipeline step.
