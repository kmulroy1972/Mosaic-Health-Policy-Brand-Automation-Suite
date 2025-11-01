# Storage Guide

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 11 Complete

## Overview

The Mosaic Brand Automation Suite provides Azure Blob Storage integration for:

- Asset storage (templates, documents, compliance reports)
- File upload/download via REST API
- Integration with SharePoint via Microsoft Graph API

## Azure Blob Storage

### Configuration

**Environment Variables:**

- `AZURE_STORAGE_CONNECTION_STRING` - Storage account connection string (preferred)
- `AZURE_STORAGE_ACCOUNT_NAME` - Storage account name (for managed identity)

### Default Container

- **Container Name:** `mhp-assets`
- **Purpose:** Store brand assets, templates, compliance reports, documents

### Supported Operations

#### Upload Blob

**Endpoint:** `POST /api/storage/upload`

**Authentication:** Required (Bearer token with `access_as_user` scope)

**Request Body:**

```json
{
  "container": "mhp-assets", // Optional, defaults to "mhp-assets"
  "blobName": "documents/report-2025.pdf",
  "content": "<base64-encoded-content>",
  "contentType": "application/pdf" // Optional
}
```

**Response:**

```json
{
  "url": "https://<account>.blob.core.windows.net/mhp-assets/documents/report-2025.pdf",
  "blobName": "documents/report-2025.pdf"
}
```

#### Download Blob

**Endpoint:** `GET /api/storage/download?container=mhp-assets&blobName=documents/report-2025.pdf`

**Authentication:** Required (Bearer token with `access_as_user` scope)

**Query Parameters:**

- `container` (optional) - Container name, defaults to `mhp-assets`
- `blobName` (required) - Name of blob to download

**Response:**

```json
{
  "blobName": "documents/report-2025.pdf",
  "container": "mhp-assets",
  "content": "<base64-encoded-content>",
  "size": 123456
}
```

## Microsoft Graph API Integration

### SharePoint Connector

The system can integrate with SharePoint document libraries via Microsoft Graph API:

**Capabilities:**

- List documents from SharePoint sites
- Download documents from SharePoint
- Upload documents to SharePoint
- Sync template metadata between SharePoint and Cosmos DB

**Graph API Scopes Required:**

- `Sites.Read.All` - Read SharePoint sites and lists
- `Sites.ReadWrite.All` - Write access to SharePoint (if needed)
- `Files.Read.All` - Read files
- `Files.ReadWrite.All` - Read/write files (if needed)

### Example: Graph API Document Sync

```typescript
import { getTemplatesFromGraph } from '../graph/templates';

// Templates are fetched from SharePoint Org Assets library
const templates = await getTemplatesFromGraph();
```

## Storage Best Practices

### Blob Naming

Use hierarchical naming for organization:

```
mhp-assets/
  ├── templates/
  │   ├── word/
  │   │   ├── policy-template-1.docx
  │   │   └── policy-template-2.docx
  │   └── ppt/
  │       └── presentation-template.pptx
  ├── documents/
  │   ├── compliance/
  │   │   └── audit-report-2025-01.pdf
  │   └── generated/
  │       └── doc-12345.pdf
  └── assets/
      ├── images/
      └── logos/
```

### Content Types

Set appropriate content types:

- `application/pdf` - PDF documents
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - DOCX
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` - PPTX
- `image/png`, `image/jpeg` - Images
- `application/json` - JSON data
- `text/plain` - Plain text

### Security

1. **Authentication Required** - All upload/download operations require valid Bearer tokens
2. **Scope Validation** - Requires `access_as_user` scope
3. **Tenant Isolation** - Consider partitioning by tenant ID in blob names
4. **Access Control** - Use Azure RBAC for container-level permissions

### Performance

1. **Chunked Uploads** - For large files, implement chunked uploads (future enhancement)
2. **CDN Integration** - Consider Azure CDN for frequently accessed assets
3. **Caching** - Cache blob metadata in Cosmos DB
4. **Async Operations** - Use Azure Storage queues for background processing

## Usage Examples

### Upload a Document

```bash
curl -X POST https://mhpbrandfunctions38e5971a.azurewebsites.net/api/storage/upload \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "blobName": "documents/compliance-report-2025.pdf",
    "content": "<base64-encoded-pdf>",
    "contentType": "application/pdf"
  }'
```

### Download a Document

```bash
curl -X GET "https://mhpbrandfunctions38e5971a.azurewebsites.net/api/storage/download?blobName=documents/compliance-report-2025.pdf" \
  -H "Authorization: Bearer <token>"
```

### List Blobs (via SDK)

```typescript
import { listBlobs } from './storage/blobClient';

const blobs = await listBlobs('mhp-assets', 'documents/compliance/');
// Returns: [{ name, size, lastModified }, ...]
```

## Integration with Other Systems

### Cosmos DB Integration

Blob storage URLs can be stored in Cosmos DB:

```typescript
// Save template metadata with blob URL
await templateRepository.upsert({
  id: 'template-123',
  name: 'Policy Template',
  source: 'manual',
  sourceId: 'https://storage.blob.core.windows.net/mhp-assets/templates/policy.docx'
  // ...
});
```

### Compliance Reports

Compliance validation results can be stored as blobs:

```typescript
const report = {
  violations: [...],
  wcagScore: 85,
  timestamp: new Date().toISOString()
};

const { url } = await uploadBlob(
  'mhp-assets',
  `compliance-reports/${reportId}.json`,
  JSON.stringify(report),
  'application/json'
);
```

## Roadmap

### Phase 11 (Current) ✅

- [x] Azure Blob Storage client and container management
- [x] Upload/download endpoints
- [x] Authentication integration
- [x] Basic blob operations

### Phase 11+ (Future)

- [ ] Chunked upload for large files
- [ ] SharePoint Graph API sync utilities
- [ ] Blob metadata indexing in Cosmos DB
- [ ] CDN integration for asset delivery
- [ ] Blob lifecycle management (auto-delete old reports)
- [ ] Shared access signatures (SAS) for temporary access
- [ ] Blob versioning
- [ ] Backup and restore procedures

## References

- [Azure Blob Storage Documentation](https://learn.microsoft.com/azure/storage/blobs/)
- [Microsoft Graph SharePoint API](https://learn.microsoft.com/graph/api/resources/sharepoint)
- [Azure Storage Best Practices](https://learn.microsoft.com/azure/storage/blobs/storage-blobs-best-practices)
