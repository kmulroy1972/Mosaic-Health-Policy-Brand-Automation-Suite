# BrandGuidanceAgent Function

## Overview

BrandGuidanceAgent is an Azure Function that analyzes documents against brand formatting and compliance rules using Azure OpenAI GPT-4o. It provides automated brand compliance checking to ensure all documents adhere to MHP (Mosaic Health Policy) brand guidelines.

## Purpose

This function serves as an automated brand compliance checker for documents, helping content creators and brand managers ensure consistency across all organizational materials. It analyzes document text and format rules to identify violations and provide actionable feedback.

## Endpoint

- **Route:** `/api/brandguidanceagent`
- **Method:** `POST`
- **Authentication:** Anonymous
- **Content-Type:** `application/json`

## Request Format

```json
{
  "documentText": "The document content to analyze...",
  "formatRules": "The formatting and brand rules to check against..."
}
```

### Required Fields

- `documentText` (string): The text content of the document to analyze
- `formatRules` (string): The formatting rules, brand guidelines, or compliance requirements to check

## Response Format

```json
{
  "summary": "Overall compliance summary (2-3 sentences)",
  "violations": ["Violation 1 description", "Violation 2 description"]
}
```

### Response Fields

- `summary` (string): Brief summary of overall compliance status
- `violations` (string[]): Array of specific violation descriptions, empty if compliant

## Environment Variables

The function requires the following environment variables to be configured in Azure:

- `OPENAI_ENDPOINT`: Azure OpenAI endpoint URL (e.g., `https://mhp-openai.openai.azure.com`)
- `OPENAI_DEPLOYMENT` or `OPENAI_MODEL_DEPLOYMENT`: Deployment name for GPT-4o model (defaults to `gpt-4o`)
- `OPENAI_API_VERSION`: API version (defaults to `2024-02-01`)
- `AZURE_OPENAI_KEY` or `OPENAI_API_KEY`: Azure OpenAI API key

## Example Request

```bash
curl -X POST https://mhpbrandfunctions38e5971a.azurewebsites.net/api/brandguidanceagent \
  -H "Content-Type: application/json" \
  -d '{
    "documentText": "This is a sample document that may contain formatting issues.",
    "formatRules": "Documents must use MHP heading styles. Body text must be Arial 12pt."
  }'
```

## Example Response

```json
{
  "summary": "The document generally follows brand guidelines, but contains some formatting inconsistencies with heading styles.",
  "violations": [
    "Document uses custom heading style instead of MHP Heading 1",
    "Body text is 11pt instead of required 12pt"
  ]
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Missing or invalid documentText field."
}
```

### 500 Internal Server Error

```json
{
  "error": "OpenAI service is not configured."
}
```

### 502 Bad Gateway

```json
{
  "error": "Brand guidance analysis service unavailable."
}
```

## Implementation Details

- Uses Azure OpenAI GPT-4o model for analysis
- Returns structured JSON responses
- Validates input payload structure
- Logs telemetry for monitoring and debugging
- Uses JSON response format for consistent parsing

## Related Functions

- `/api/ai/rewrite` - AI-powered text rewriting
- `/api/templates` - Template management
- `/api/health` - Health check endpoint
