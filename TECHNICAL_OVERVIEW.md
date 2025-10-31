# Mosaic Health Policy Brand Automation Suite - Technical Overview

**Version:** 0.0.1  
**Status:** Infrastructure Complete, UI Development Pending  
**Last Updated:** January 2025

---

## Executive Summary

The MHP Brand Automation Suite is a comprehensive Office Add-in platform designed to enforce brand compliance, accessibility standards, and streamline document production across Word, PowerPoint, and Outlook. After 6 months of development, the **infrastructure and backend codebase are complete**, but the **user-facing interface remains to be built**.

### Current State

✅ **COMPLETE:**

- Azure Functions backend with 6 API endpoints
- Azure Static Web Apps hosting
- GitHub CI/CD automation
- Office Add-in framework (Word integration working)
- TypeScript/React component library
- Brand formatting logic (`applyBrand`, `previewBrand`, etc.)
- CORS and authentication configured

❌ **MISSING:**

- User interface connecting to formatting functions
- Template picker UI
- Brand compliance checker UI
- Document formatting controls
- Settings/configuration panels

---

## Technical Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    OFFICE CLIENTS                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │   Word   │  │PowerPoint│  │ Outlook  │                  │
│  │  Add-in  │  │  Add-in  │  │  Add-in  │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
└───────┼─────────────┼─────────────┼─────────────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    SHARED PACKAGES         │
        │  ┌──────────────┐         │
        │  │Shared Brand  │         │
        │  │Core Library  │         │
        │  └──────────────┘         │
        │  ┌──────────────┐         │
        │  │Shared UI     │         │
        │  │(React)      │         │
        │  └──────────────┘         │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   AZURE FUNCTIONS BACKEND  │
        │  ┌──────────────────────┐ │
        │  │ /api/health          │ │
        │  │ /api/templates       │ │
        │  │ /api/rewrite         │ │
        │  │ /api/pdf/convert     │ │
        │  │ /api/pdf/validate   │ │
        │  │ /api/graph/proxy    │ │
        │  └──────────────────────┘ │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    AZURE SERVICES          │
        │  • Key Vault (secrets)     │
        │  • App Configuration       │
        │  • Application Insights    │
        │  • Azure OpenAI            │
        │  • Microsoft Graph         │
        └────────────────────────────┘
```

### Package Structure

#### 1. **packages/addins-word** (Word Add-in)

**Status:** ✅ Code Complete, ❌ UI Missing

**Responsibilities:**

- Apply brand styles to Word documents
- Manage document protections
- Accessibility checks
- PDF export orchestration

**Key Functions:**

- `applyBrand()` - Applies brand styles, headers/footers, restrictions
- `previewBrand()` - Previews branding changes before applying
- `restrictParagraphStyles()` - Limits styles to brand-approved list
- `restrictCharacterStyles()` - Limits character styles
- `applyHeadersFooters()` - Inserts headers/footers from templates
- `assessAltText()` - Checks image accessibility
- `lockBrandAnchors()` - Protects branding elements
- `exportPdf()` - Orchestrates PDF export with validation

**Brand Styles Supported:**

- Paragraph Styles: MHP Title, MHP Heading 1-4, MHP Body, MHP Caption, MHP Quote
- Character Styles: MHP Emphasis, MHP Accent, MHP Strong, MHP Small Caps

**Current UI:** Basic taskpane with "Test Button" only (not connected to functions)

---

#### 2. **packages/addins-ppt** (PowerPoint Add-in)

**Status:** ✅ Code Complete, ❌ UI Missing

**Responsibilities:**

- Synchronize official slide masters
- Enforce layout/tag governance
- Accessibility remediation
- Undoable fix actions

**Key Functions:**

- Master template synchronization
- Layout enforcement
- Accessibility fixes
- Tag governance

---

#### 3. **packages/addins-outlook** (Outlook Add-in)

**Status:** ✅ Code Complete, ❌ UI Missing

**Responsibilities:**

- On-send compliance checks
- Signature/disclaimer injection
- Policy override workflow
- Telemetry emission

**Key Functions:**

- OnMessageSend event handler
- Domain policy evaluation
- Keyword matching
- Signature management

---

#### 4. **packages/shared-brand-core** (Core Business Logic)

**Status:** ✅ Complete and Functional

**Responsibilities:**

- Cross-host business logic
- Graph client with throttling resilience
- Feature flag reader
- Telemetry helpers
- PDF coordination
- AI routing guardrails
- Configuration loader

**Key Modules:**

- `GraphClient` - Microsoft Graph API client with retry logic
- `TemplateCache` - Template metadata caching
- `PDFExportCoordinator` - PDF export orchestration
- `AIRewriteGuard` - PHI/PII protection for AI features
- `Telemetry` - PII-scrubbed event logging

---

#### 5. **packages/shared-ui** (React Component Library)

**Status:** ✅ Components Built, ❌ Not Integrated

**Responsibilities:**

- Brand-aligned UI kit
- Accessibility primitives
- IndexedDB-backed preference storage
- Internationalization (i18n) layer

**Components Available:**

- Button, Toast, ProgressBar, Panel, Wizard
- Tooltip, Modal, Toggle, Dropdown, Tag
- TemplatePicker
- Hooks for focus management and motion preferences
- Tokenized theme generator

**Note:** Components exist but not used in current taskpane

---

#### 6. **packages/backend-functions** (Azure Functions API)

**Status:** ✅ Complete and Deployed

**Base URL:** `https://api.mosaicpolicy.com`

**Endpoints:**

| Endpoint            | Method | Purpose                                     | Status         |
| ------------------- | ------ | ------------------------------------------- | -------------- |
| `/api/health`       | GET    | Health check, version, system status        | ✅ Working     |
| `/api/templates`    | GET    | List available templates from SharePoint    | ✅ Implemented |
| `/api/rewrite`      | POST   | AI-powered text rewriting with brand safety | ✅ Implemented |
| `/api/pdf/convert`  | POST   | Convert documents to PDF/A format           | ✅ Implemented |
| `/api/pdf/validate` | POST   | Validate PDF accessibility compliance       | ✅ Implemented |
| `/api/graph/proxy`  | POST   | Centralized Microsoft Graph API proxy       | ✅ Implemented |

**Authentication:**

- Entra ID SSO via Nested App Authentication
- OAuth 2.0 On-Behalf-Of (OBO) flow
- Token exchange via HTTPS

**Configuration:**

- Secrets stored in Azure Key Vault
- Feature flags in Azure App Configuration
- Telemetry to Application Insights

---

### Infrastructure Components

#### Azure Resources

**Azure Static Web Apps:**

- **Name:** `mosaic-brand-console2`
- **URL:** `https://white-smoke-0061d650f.3.azurestaticapps.net`
- **Resource Group:** `mhp-brand-rg`
- **Status:** ✅ Deployed and Live
- **CDN:** Cloudways (custom domain: `cdn.mosaicpolicy.com`)

**Azure Functions:**

- **Name:** `mhpbrandfunctions38e5971a`
- **URL:** `https://api.mosaicpolicy.com`
- **Resource Group:** `mhp-brand-rg`
- **Status:** ✅ Deployed, CORS configured
- **Runtime:** Node.js 20
- **Functions:** 6 HTTP-triggered functions

**Azure Key Vault:**

- Stores: API keys, client secrets, certificates
- Access: Managed identity for Functions

**Azure App Configuration:**

- Feature flags and environment configuration
- Blue/green deployment toggles

**Azure Application Insights:**

- Telemetry ingestion (PII-scrubbed)
- Error tracking and performance monitoring

**Azure OpenAI:**

- Brand-safe text rewriting
- PHI/PII protection enforced

---

### Deployment Architecture

**CI/CD Pipeline:**

- **GitHub Actions:** Automated deployments on push to `main`
- **Workflows:**
  - `azure-static-web-apps-mosaic.yml` - Static site deployment
  - `deploy-static-site.yml` - Cloudways CDN deployment
  - `release.yml` - Production release automation

**Environments:**

- **Dev:** Azure Static Web Apps + Functions dev slot
- **Test:** Azure Blob + CDN + Functions staging slot
- **Prod:** Azure CDN + Functions production slot

**Manifests:**

- Unified JSON manifests: `manifest/unified.{dev,test,prod}.json`
- Classic XML manifests: `manifest/sideload/word.{dev,test,prod}.xml`
- Version: 2.0.0.0 (current)

---

## Current Capabilities

### ✅ What Works Now

#### 1. Infrastructure & Deployment

- Azure Functions backend is live and responding
- Static Web Apps hosting is operational
- GitHub Actions CI/CD is automated
- CORS configured correctly
- Authentication framework in place
- Health endpoint monitoring

#### 2. Backend APIs

- Health check endpoint: `/api/health` ✅
- Templates endpoint: `/api/templates` ✅
- AI rewrite endpoint: `/api/rewrite` ✅
- PDF conversion: `/api/pdf/convert` ✅
- PDF validation: `/api/pdf/validate` ✅
- Graph proxy: `/api/graph/proxy` ✅

#### 3. Code Functions (Not Exposed via UI)

- Brand style application logic
- Header/footer insertion
- Style restrictions
- Accessibility assessment
- Document protection
- Template system structure

#### 4. Office Add-in Framework

- Word Add-in loads successfully
- Office.js integration working
- Taskpane displays correctly
- Manifest deployment functional

#### 5. Developer Tools

- TypeScript compilation
- Linting and formatting
- Unit tests framework
- Storybook for UI components
- Playwright for E2E testing

---

### ❌ What's Missing

#### 1. User Interface (Critical Gap)

- No "Apply Brand" button in taskpane
- No template picker UI
- No style selector
- No brand compliance checker
- No settings/configuration panel
- No progress indicators
- No error handling UI

**Current Taskpane:** Only shows a "Test Button" that inserts sample text

#### 2. Function Integration

- `applyBrand()` function exists but not callable from UI
- `previewBrand()` function exists but not accessible
- Template system has no UI
- PDF export has no UI trigger

#### 3. Advanced Features

- Template library browser
- AI rewrite UI panel
- Batch document processing
- Brand compliance dashboard
- User preferences/settings

#### 4. Production Readiness

- User onboarding/tutorial
- Help documentation
- Error recovery workflows
- Offline mode handling
- Performance optimization

---

## Next Steps to Build Full App

### Phase 1: Minimum Viable Product (40-60 hours)

**Goal:** Get basic formatting working with simple UI

**Tasks:**

1. **Build Core UI Components (20 hours)**
   - Replace `apps/dev-host/public/index.html` with functional UI
   - Add "Apply Brand Formatting" button
   - Add "Preview Brand Changes" button
   - Add basic loading states
   - Add success/error messages

2. **Connect UI to Functions (15 hours)**
   - Import `applyBrand()` from `packages/addins-word`
   - Wire button click to function call
   - Handle async responses
   - Display results/errors

3. **Add Style Picker (10 hours)**
   - Dropdown/selector for brand styles
   - Preview style changes
   - Apply to selection or document

4. **Testing & Polish (10 hours)**
   - Test in Word Desktop and Online
   - Fix UI bugs
   - Improve user feedback
   - Basic error handling

**Deliverable:** Working "Apply Brand" button that formats documents

---

### Phase 2: Enhanced UI (60-80 hours)

**Goal:** Professional, user-friendly interface

**Tasks:**

1. **Integrate Shared UI Components (20 hours)**
   - Use React components from `packages/shared-ui`
   - Replace basic HTML with professional UI kit
   - Add Toast notifications
   - Add ProgressBar for async operations
   - Implement Modal dialogs

2. **Template Picker (25 hours)**
   - Build template browser UI
   - Connect to `/api/templates` endpoint
   - Display template previews
   - Implement template insertion
   - Add search/filter functionality

3. **Brand Compliance Checker (20 hours)**
   - Build compliance report UI
   - Display accessibility issues
   - Show style violations
   - Provide fix suggestions
   - Generate compliance report

4. **Settings & Configuration (15 hours)**
   - User preferences panel
   - Brand style customization
   - Default settings
   - Save to IndexedDB

**Deliverable:** Professional, full-featured formatting interface

---

### Phase 3: Advanced Features (80-120 hours)

**Goal:** Enterprise-grade capabilities

**Tasks:**

1. **AI Rewrite Integration (30 hours)**
   - Build rewrite UI panel
   - Connect to `/api/rewrite`
   - Text selection interface
   - Brand safety indicators
   - PHI/PII warnings

2. **PDF Export & Validation (25 hours)**
   - PDF export button
   - PDF/A conversion UI
   - Validation results display
   - Accessibility report

3. **Batch Processing (20 hours)**
   - Multi-document selection
   - Batch brand application
   - Progress tracking
   - Summary reports

4. **Analytics & Reporting (15 hours)**
   - Usage statistics
   - Compliance reports
   - Style usage analytics
   - Export to Excel/PDF

5. **PowerPoint & Outlook Add-ins (30 hours)**
   - Port UI patterns to PPT add-in
   - Port UI patterns to Outlook add-in
   - Consistent UX across Office apps

**Deliverable:** Complete brand automation suite

---

### Phase 4: Production Polish (40-60 hours)

**Goal:** Enterprise-ready deployment

**Tasks:**

1. **User Experience (20 hours)**
   - First-run tutorial
   - Help documentation
   - Keyboard shortcuts
   - Accessibility improvements

2. **Error Handling (15 hours)**
   - Comprehensive error messages
   - Recovery workflows
   - Offline mode support
   - Retry mechanisms

3. **Performance (10 hours)**
   - Code splitting
   - Lazy loading
   - Cache optimization
   - Bundle size reduction

4. **Testing (15 hours)**
   - E2E test coverage
   - Accessibility testing
   - Cross-browser testing
   - Performance testing

**Deliverable:** Production-ready application

---

## Use Cases

### Primary Use Cases

#### 1. Document Branding

**User:** Content creator, marketing professional  
**Goal:** Apply consistent brand styling to Word documents

**Workflow:**

1. Open Word document
2. Click "Mosaic Brand Console" in ribbon
3. Click "Apply Brand Formatting"
4. System applies brand styles, headers/footers
5. Document is brand-compliant

**Value:** Saves 30-60 minutes per document, ensures consistency

---

#### 2. Template Management

**User:** Document manager, brand administrator  
**Goal:** Access and insert pre-approved brand templates

**Workflow:**

1. Open Word document
2. Open template picker from taskpane
3. Browse/search templates from SharePoint
4. Preview template
5. Insert template into document

**Value:** Ensures only approved templates are used, maintains brand consistency

---

#### 3. Brand Compliance Checking

**User:** Quality assurance, brand manager  
**Goal:** Verify document meets brand standards

**Workflow:**

1. Open document
2. Click "Check Brand Compliance"
3. System scans document for:
   - Style violations
   - Missing alt text
   - Brand guideline violations
4. View compliance report
5. Apply suggested fixes

**Value:** Automated quality assurance, prevents brand violations

---

#### 4. AI-Powered Content Rewriting

**User:** Content writer, communication specialist  
**Goal:** Rewrite text while maintaining brand voice

**Workflow:**

1. Select text in document
2. Click "Rewrite with AI"
3. Choose brand voice/style
4. Review AI suggestions
5. Apply rewrite to document

**Value:** Maintains brand consistency in messaging, speeds up editing

---

#### 5. PDF Accessibility Validation

**User:** Document publisher, accessibility coordinator  
**Goal:** Ensure PDFs meet accessibility standards

**Workflow:**

1. Export document to PDF
2. System automatically validates PDF
3. View accessibility report
4. Fix issues if needed
5. Re-export compliant PDF

**Value:** Ensures WCAG compliance, reduces legal risk

---

### Secondary Use Cases

#### 6. Batch Document Processing

**User:** Administrator, document manager  
**Scenario:** Apply branding to multiple documents at once

#### 7. Brand Style Customization

**User:** Brand administrator  
**Scenario:** Configure custom brand styles for organization

#### 8. Template Publishing

**User:** Brand manager, content creator  
**Scenario:** Publish new templates to SharePoint Org Assets

---

## Technology Stack

### Frontend

- **TypeScript:** Primary language
- **React:** UI component library
- **Office.js:** Office Add-in API
- **IndexedDB:** Client-side storage
- **Modern CSS:** Custom styling with design tokens

### Backend

- **Node.js 20:** Runtime
- **Azure Functions v4:** Serverless compute
- **TypeScript:** Type-safe development
- **Microsoft Graph API:** SharePoint/OneDrive integration
- **Azure OpenAI:** AI-powered features

### Infrastructure

- **Azure Static Web Apps:** Frontend hosting
- **Azure Functions:** Backend API
- **Azure Key Vault:** Secrets management
- **Azure App Configuration:** Feature flags
- **Application Insights:** Telemetry
- **Cloudways:** CDN hosting (custom domain)

### DevOps

- **GitHub Actions:** CI/CD automation
- **pnpm:** Package management
- **TypeScript Compiler:** Build system
- **ESLint/Prettier:** Code quality
- **Jest/Playwright:** Testing

---

## Data Flow & Security

### Authentication Flow

1. User opens Office Add-in
2. Add-in requests SSO token from Entra ID
3. Token exchanged for backend access token (OBO)
4. Backend functions use token for Graph API calls
5. Tokens cached and refreshed automatically

### Data Flow - Template Access

1. User opens template picker
2. Frontend calls `/api/templates`
3. Backend queries Microsoft Graph for SharePoint templates
4. Results cached in IndexedDB for offline access
5. User selects template → inserted into document

### Data Flow - Brand Application

1. User clicks "Apply Brand"
2. Frontend calls `applyBrand()` function
3. Function reads document content via Office.js
4. Applies brand styles, headers/footers
5. Updates document via Office.js API
6. Generates compliance manifest

### Security & Privacy

**PHI/PII Protection:**

- AI rewrite requests redacted when `piiMode=true`
- PDF conversion logs only metadata
- Telemetry excludes document content
- Graph API calls use least-privilege tokens

**CORS & CSP:**

- CORS configured for specific domains
- Content Security Policy enforced
- Inline scripts disallowed (except Office.js)
- Secure token transmission only

---

## Performance Considerations

### Current Performance

- API response time: <200ms (health endpoint)
- Add-in load time: <2 seconds
- Template fetch: <1 second (cached)
- Brand application: 2-5 seconds (document size dependent)

### Optimization Opportunities

- Code splitting for faster initial load
- Lazy loading of UI components
- Template preview caching
- Incremental document processing
- Background processing for large documents

---

## Scalability

### Current Limits

- **Azure Functions:** Consumption plan (auto-scaling)
- **Static Web Apps:** Free tier (100GB bandwidth/month)
- **API Rate Limits:** Microsoft Graph throttling handled

### Scaling Path

- **Functions:** Upgrade to Premium plan for higher concurrency
- **Static Web Apps:** Upgrade tier for more bandwidth
- **CDN:** Cloudways auto-scales
- **Graph API:** Implement advanced throttling resilience

---

## Cost Analysis

### Current Monthly Costs (Estimated)

- **Azure Functions:** $0-20 (consumption plan)
- **Azure Static Web Apps:** $0 (free tier)
- **Azure Key Vault:** $0.03 per secret/month
- **Application Insights:** $0-50 (depending on telemetry volume)
- **Cloudways CDN:** Variable (custom plan)
- **Azure OpenAI:** Pay-per-use (if enabled)

**Total Estimated:** $50-150/month for current usage

### Scaling Costs

- **High Volume (1000+ users):** $200-500/month
- **Enterprise (10000+ users):** $1000-2000/month

---

## Development Roadmap Summary

### Immediate (Phase 1): 40-60 hours

**Goal:** Basic working formatting app
**Deliverable:** "Apply Brand" button that works

### Short-term (Phase 2): 60-80 hours

**Goal:** Professional UI with templates
**Deliverable:** Full-featured formatting interface

### Medium-term (Phase 3): 80-120 hours

**Goal:** Advanced features
**Deliverable:** Complete brand automation suite

### Long-term (Phase 4): 40-60 hours

**Goal:** Production polish
**Deliverable:** Enterprise-ready application

**Total Estimated:** 220-320 hours (6-8 weeks full-time, or 3-4 months part-time)

---

## Decision Framework

### Continue Development If:

✅ You format 10+ documents per month  
✅ You need custom features not available elsewhere  
✅ You plan to use this long-term (years)  
✅ You have 40+ hours to invest  
✅ This is for client work (monetizable)  
✅ You can commit to focused development time

### Consider Alternatives If:

❌ You format documents occasionally (1-5/month)  
❌ Standard Word templates would work  
❌ Time cost > value you'd get back  
❌ You can't commit 40+ hours  
❌ Existing solutions meet your needs

### Recommended Approach:

1. **Try simple solution first:** Build Word template with brand styles (2-3 hours)
2. **Evaluate after 1 week:** Is template sufficient?
3. **If template works:** Stop here, use simpler solution
4. **If you need more:** Commit to Phase 1 (40-60 hours) to get basic add-in working
5. **Iterate from there:** Build additional features incrementally

---

## Conclusion

You have built a **solid foundation** with professional-grade infrastructure and backend code. The gap is in the **user interface** - connecting your excellent backend code to actual users.

**The choice is:**

1. **Continue:** 40-60 hours to get a basic working app, 220-320 hours for full suite
2. **Simplify:** Use Word templates/macros (2-8 hours) for 80% of functionality
3. **Hybrid:** Use simple solution now, build add-in gradually as needed

The infrastructure you've built is valuable - the question is whether the remaining UI development time is worth it for your specific use case.

---

## Appendix: Key Files & Locations

### Critical Files

- **Manifest:** `manifest/sideload/word.dev.xml`
- **Taskpane UI:** `apps/dev-host/public/index.html`
- **Word Functions:** `packages/addins-word/src/commands/applyBrand.ts`
- **Backend Entry:** `packages/backend-functions/src/index.ts`
- **API Console:** `apps/dev-host/public/api-console.html`

### Deployment URLs

- **Frontend:** `https://white-smoke-0061d650f.3.azurestaticapps.net`
- **API:** `https://api.mosaicpolicy.com`
- **CDN:** `https://cdn.mosaicpolicy.com` (Cloudways)

### Documentation

- **Architecture:** `docs/architecture/component-boundaries.md`
- **Deployment:** `docs/deployment/overview.md`
- **Identity:** `docs/identity/naa-config.md`

---

**Document Version:** 1.0  
**Generated:** January 2025  
**Status:** Complete Technical Overview
