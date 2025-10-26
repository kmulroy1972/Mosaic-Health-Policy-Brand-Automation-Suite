# PDF Validation Harness

This harness verifies that exported documents comply with PDF/UA and optional PDF/A-2b requirements.

## Prerequisites

- Docker Desktop or podman.
- `veraPDF` docker image (`verapdf/verapdf`), pulled prior to running.
- Exported sample PDFs under `tests/pdf/samples/`. The CI build drops outputs there when running `pnpm test:pdf`.

## Running Locally

```bash
pnpm test:pdf
```

This runs `tests/pdf/validate.ts`, which:

1. Enumerates PDF samples in `tests/pdf/samples`.
2. Detects files tagged for PDF/A conversion via filename suffix `*.pdfa.pdf`.
3. Executes veraPDF in a container for each PDF, fails fast on invalid results, and writes validator XML artefacts into `coverage/veraPDF`.

## Adding Samples

- `*.standard.pdf`: generated via in-app export (expected PDF/UA compliance).
- `*.pdfa.pdf`: generated via backend conversion (must pass PDF/A-2b and PDF/UA checks).
- Include metadata JSON (same filename `.json`) describing source host and feature flags.

## CI Integration

- The `release` workflow mounts the workspace and runs `pnpm test:pdf`.
- Reports are published as build artefacts. Failures block the release.
