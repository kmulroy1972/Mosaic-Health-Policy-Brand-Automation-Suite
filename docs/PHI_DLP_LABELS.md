# Purview DLP + MIP Labeling Automation

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 30 Complete

## DLP (Data Loss Prevention)

### Presidio Integration

**Location:** `packages/backend-functions/src/compliance/presidio.ts`

- PII detection in payloads
- Automatic masking for positive PHI signals
- Configurable entity types

### MIP Labeling

**Location:** `packages/backend-functions/src/compliance/mip.ts`

- Auto-apply sensitivity labels
- Configurable label names
- Document-level labeling

## Endpoint

**POST** `/api/compliance/label`

**Request:**

```json
{
  "content": "Patient name: John Doe, SSN: 123-45-6789",
  "documentPath": "documents/report.pdf",
  "label": {
    "name": "Confidential",
    "id": "label-id",
    "sensitivity": "Confidential"
  },
  "autoMask": true
}
```

**Response:**

```json
{
  "piiDetection": {
    "entities": [{ "type": "PERSON", "start": 13, "end": 21 }],
    "maskedText": "..."
  },
  "masking": {
    "maskedText": "Patient name: [PERSON], SSN: [SSN]"
  },
  "mipLabeling": {
    "success": true,
    "labelId": "label-id"
  }
}
```

## Implementation Status

⚠️ **Presidio and MIP SDK Integration Pending**

Current implementation provides:

- PII detection structure
- Masking logic
- MIP labeling interface
- Endpoint integration

**TODO:**

- Integrate Azure Presidio or equivalent PII detection service
- Integrate MIP SDK for document labeling
- Configure label policies
- False-positive override mechanism
