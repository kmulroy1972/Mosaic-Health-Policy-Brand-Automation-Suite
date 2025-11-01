# Mosaic Functions Status Report

**Generated:** 2025-10-31 21:28:00 UTC  
**Last Commit:** c2a0f567743d14437cb16a3645b151542c67f3c7 - Phase 2-3 complete - BrandGuidanceAgent validation and PDF pipeline enhancements  
**Deployment:** mhpbrandfunctions38e5971a.azurewebsites.net

## Endpoint Status

| Endpoint       | Method | Route                         | Status                 | Last Verified    |
| -------------- | ------ | ----------------------------- | ---------------------- | ---------------- |
| Health Check   | GET    | `/api/api/health`             | ✅ 200                 | 2025-10-31 21:21 |
| Templates      | GET    | `/api/api/templates`          | ⚠️ Needs Test          | -                |
| AI Rewrite     | POST   | `/api/api/rewrite`            | ⚠️ Needs OpenAI Config | -                |
| Brand Guidance | POST   | `/api/api/brandguidanceagent` | ⚠️ Needs OpenAI Config | -                |
| PDF Convert    | POST   | `/api/api/pdf/convert`        | ✅ Deployed            | -                |
| PDF Validate   | POST   | `/api/api/pdf/validate`       | ✅ Deployed            | -                |

## Deployment Information

- **Function App:** mhpbrandfunctions38e5971a
- **Resource Group:** mhp-brand-rg
- **Subscription:** Azure subscription 1
- **Runtime:** Node.js 20 (upgrade to 22 recommended)
- **Status:** Running

## Environment Variables Required

- `OPENAI_ENDPOINT` - Azure OpenAI endpoint
- `OPENAI_DEPLOYMENT` - GPT-4o deployment name
- `OPENAI_API_VERSION` - API version (default: 2024-02-01)
- `AZURE_OPENAI_KEY` - Azure OpenAI API key

## Test Commands

### Health Check

```bash
curl https://mhpbrandfunctions38e5971a.azurewebsites.net/api/api/health
```

### Templates

```bash
curl https://mhpbrandfunctions38e5971a.azurewebsites.net/api/api/templates
```

### Brand Guidance

```bash
curl -X POST https://mhpbrandfunctions38e5971a.azurewebsites.net/api/api/brandguidanceagent \
  -H "Content-Type: application/json" \
  -d '{"documentText": "Test", "formatRules": "Rules"}'
```

### PDF Validation

```bash
curl -X POST https://mhpbrandfunctions38e5971a.azurewebsites.net/api/api/pdf/validate \
  -H "Content-Type: application/json" \
  -d '{"pdfBase64": "base64-encoded-pdf-content"}'
```

## Recent Changes

- Phase 1: Baseline verification and dependency fixes
- Phase 2: BrandGuidanceAgent validation
- Phase 3: PDF pipeline enhancements
- Phase 4: Template & Rewrite caching layer
