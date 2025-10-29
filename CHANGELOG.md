# Changelog

All notable changes to the Mosaic Health Policy Brand Automation Suite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - In Progress

### Planned - Backend Integration & UI Expansion

#### Added

- Backend API health check integration with https://api.mosaicpolicy.com/api/health
- Real Brand Guidelines section in taskpane
- Real Templates section in taskpane
- commands.html for add-in command functions
- Icon assets (16px, 32px, 64px, 80px) in /assets directory

#### Enhanced

- Taskpane UI with multi-section layout
- API connectivity and error handling
- User feedback and loading states
- Brand automation workflows

#### Infrastructure

- API endpoint integration tests
- Enhanced error logging and telemetry
- Improved user experience

### Notes

- Development branch: feature/v0.3.0-backend-ui
- Target: Full backend integration with Azure Functions
- Focus: Production-ready UI and functionality

---

## [0.2.1] - 2025-10-28

### Verified

- Cloudways migration complete
- CI/CD workflow tested and operational
- GitHub Actions deployment pipeline validated
- Tag-based release automation confirmed working

### Infrastructure

- Workflow successfully triggered by v0.2.1 tag
- Build system compiling correctly (TypeScript → JavaScript)
- Static files prepared for deployment to cdn.mosaicpolicy.com

### Notes

- Deployment workflow status: In Progress
- Secrets configuration: CLOUDWAYS_SFTP_HOST, CLOUDWAYS_SFTP_USER, CLOUDWAYS_SFTP_PASS
- Target deployment path: /home/master/applications/mosaichealthpolicy/public_html/

## [0.2.0] - 2025-10-27

### Added

- GitHub Actions workflow for automated deployment to Cloudways
- Health check endpoint for backend Azure Functions
- Word XML manifests for sideloading (dev, test, prod)
- HTTPS development server with SSL certificate support
- Content Security Policy configuration for production domains
- Comprehensive development and migration documentation

### Changed

- Migrated from localhost:3000 to cdn.mosaicpolicy.com
- Updated all manifests to use cloud CDN URLs
- Configured CSP to allow cdn.mosaicpolicy.com and api.mosaicpolicy.com
- Enhanced server with proper MIME type handling and CORS headers

### Infrastructure

- Created .github/workflows/deploy-static-site.yml for CI/CD
- Set up pnpm-based build and deployment pipeline
- Configured SFTP deployment to Cloudways hosting

### Documentation

- Created DEVELOPMENT_REPORT.md (comprehensive technical documentation)
- Created CLOUDWAYS_MIGRATION.md (migration guide and status)
- Created DEV_SETUP.md (local development setup guide)
- Created manifest/sideload/README.md (sideloading instructions)
- Created manifest/sideload/VALIDATION.md (manifest validation procedures)
- Added clear-word-cache.sh and install-cert.sh utility scripts

### Testing

- 6 unit tests created for health endpoint (all passing)
- All manifests validated successfully using office-addin-manifest@1.10.0
- TypeScript compilation verified with no errors

### Technical Details

- Health endpoint: packages/backend-functions/src/health/
- Manifests: manifest/sideload/word.{dev,test,prod}.xml
- Dev server: apps/dev-host/src/server.ts (HTTPS with CSP)
- Deployment target: Cloudways SFTP (rsync)

## [0.1.0] - 2025-10-26

### Initial Release

- Repository structure established
- TypeScript monorepo with pnpm workspaces
- Office Add-in packages for Word, PowerPoint, and Outlook
- Shared brand core and UI components
- Azure Functions backend integration
- Microsoft Graph and OpenAI integration
- Jest testing framework setup
- Playwright E2E testing configuration
