# Authentication & Authorization Specification

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 9 Complete

## Overview

The Mosaic Brand Automation Suite implements JWT/Entra ID authentication using:

- **Bearer Token Authentication** - JWT tokens from Entra ID / Azure AD
- **On-Behalf-Of (OBO) Flow** - Token exchange for Microsoft Graph API access
- **Scope-Based Authorization** - Fine-grained permission checks
- **Azure Key Vault Integration** - Secure secret storage (configured, pending full implementation)

## Architecture

### Authentication Flow

1. **Client** (Office Add-in, web app, etc.) acquires token from Entra ID
2. **Token** sent in `Authorization: Bearer <token>` header
3. **Backend** validates token structure, expiration, and signature
4. **Scopes** checked against required permissions
5. **Authenticated Context** passed to function handler

### Token Validation

**Location:** `packages/backend-functions/src/auth/tokenValidator.ts`

Validates JWT tokens from Entra ID:

- Token structure (header.payload.signature)
- Expiration time (`exp` claim)
- Not-before time (`nbf` claim)
- Issuer validation (must be Microsoft login endpoint)
- Scope extraction from `scp`, `roles`, or `scope` claims

#### Current Implementation

- ✅ Basic token structure validation
- ✅ Expiration checking
- ✅ Scope extraction
- ⚠️ Signature verification (stub - requires JWKS endpoint integration)
- ⚠️ Full issuer validation (basic checks only)

#### Production Requirements

In production, implement:

- JWKS endpoint integration for signature verification
- Full issuer validation against tenant
- Audience (`aud`) claim validation
- Token revocation checking

### Authentication Middleware

**Location:** `packages/backend-functions/src/auth/middleware.ts`

Provides:

- `authenticateRequest()` - Validates Bearer tokens
- `requireAuth()` - Wrapper for protected endpoints
- `getSecretFromKeyVault()` - Key Vault integration (stub)

#### Usage Example

```typescript
import { requireAuth } from '../auth/middleware';

export const myProtectedHandler = requireAuth(
  async (request, context, authContext) => {
    // authContext contains:
    // - userId: string
    // - tenantId: string
    // - scopes: string[]
    // - token: string
    // - isAuthenticated: boolean

    return {
      status: 200,
      jsonBody: { message: `Hello ${authContext.userId}` }
    };
  },
  {
    requireAuth: true,
    allowedScopes: ['access_as_user', 'Files.Read']
  }
);
```

### Authentication Endpoint

**POST/GET** `/api/auth/validate`

Validates a Bearer token and returns authentication status.

#### Request

```
Headers:
  Authorization: Bearer <token>
```

#### Response (Success)

```json
{
  "valid": true,
  "authenticated": true,
  "userId": "abc123...",
  "tenantId": "def456...",
  "scopes": ["access_as_user", "Files.Read"]
}
```

#### Response (Invalid/No Token)

```json
{
  "valid": false,
  "authenticated": false,
  "message": "No valid token provided"
}
```

## Security Configuration

### Protected Endpoints

Currently secured endpoints:

- **POST** `/api/rewrite` - AI rewrite service (requires auth by default, can be disabled via `REQUIRE_AUTH_REWRITE=false`)

Endpoints with authentication optional:

- **GET/POST** `/api/auth/validate` - Token validation endpoint

Endpoints remaining anonymous (for backward compatibility):

- **GET** `/api/health` - Health check
- **GET** `/api/templates` - Template list
- **POST** `/api/pdf/convert` - PDF conversion
- **POST** `/api/pdf/validate` - PDF validation
- **POST** `/api/brandguidanceagent` - Brand guidance agent
- **POST** `/api/compliance/validate` - Compliance validation

### Environment Variables

| Variable                     | Description                                                                       | Required                         |
| ---------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| `AAD_ISSUER`                 | Expected token issuer (e.g., `https://login.microsoftonline.com/{tenantId}/v2.0`) | No (uses tenant ID from token)   |
| `AZURE_KEY_VAULT_URL`        | Key Vault URL for secret storage                                                  | No (falls back to env vars)      |
| `REQUIRE_AUTH_REWRITE`       | Require auth for rewrite endpoint (`true`/`false`)                                | No (default: `true`)             |
| `TENANT_ID`                  | Azure AD tenant ID                                                                | Yes (for OBO flow)               |
| `CONFIDENTIAL_CLIENT_ID`     | Backend app registration client ID                                                | Yes (for OBO flow)               |
| `CONFIDENTIAL_CLIENT_SECRET` | Backend app registration secret                                                   | Yes (for OBO flow, or Key Vault) |

### Key Vault Integration

**Status:** ⚠️ Configured but not fully implemented

The system supports Azure Key Vault for storing secrets:

- Detects Key Vault URL from `AZURE_KEY_VAULT_URL` environment variable
- Falls back to environment variables if Key Vault not configured
- Uses managed identity for Key Vault access

**TODO:** Implement full Key Vault integration using `@azure/keyvault-secrets`

## Nested App Authentication (NAA)

The system supports Office Add-in authentication via NAA:

### Token Flow

1. **Office Runtime** acquires token using NAA configuration
2. **Add-in** sends token to backend in `Authorization` header
3. **Backend** validates token structure and scopes
4. **OBO Exchange** (if needed) for Graph API access using `OnBehalfOfCredential`

### Required Scopes

- `access_as_user` - Primary scope for backend API access
- `User.Read` - User profile information
- `Files.Read` - Read Office files
- `Files.ReadWrite` - Read/write Office files
- `Sites.Read.All` - SharePoint site access (if needed)

### Example: OBO Flow

See `samples/obo-function.ts` for a complete example of On-Behalf-Of token exchange.

## Token Claims

### Standard Claims

JWT tokens from Entra ID include:

- `oid` / `sub` - User object ID (userId)
- `tid` - Tenant ID
- `iss` - Issuer (Microsoft login endpoint)
- `aud` - Audience (API resource identifier)
- `exp` - Expiration timestamp
- `nbf` - Not-before timestamp
- `iat` - Issued-at timestamp
- `scp` - Space-separated scopes
- `roles` - Array of role names

### Custom Claims

Additional claims may be present based on app registration configuration.

## Authorization Patterns

### Scope-Based Authorization

Check if user has required scopes:

```typescript
const authResult = await authenticateRequest(request, context, {
  requireAuth: true,
  allowedScopes: ['Files.Read', 'Files.ReadWrite']
});
```

### Role-Based Authorization

Extract roles from token and check:

```typescript
if (authContext.scopes.includes('Admin')) {
  // Admin-only operation
}
```

### Resource-Based Authorization

Use tenant ID or user ID for data isolation:

```typescript
if (authContext.tenantId !== expectedTenantId) {
  return { status: 403, jsonBody: { error: 'Forbidden' } };
}
```

## Error Responses

### 401 Unauthorized

- Missing `Authorization` header
- Invalid token format
- Token expired
- Token validation failed

### 403 Forbidden

- Insufficient scopes
- Resource access denied
- Tenant mismatch

### 500 Internal Server Error

- Key Vault access failure
- Token validation service error
- Configuration error

## Security Best Practices

1. **Always validate tokens** - Never trust client-provided tokens without validation
2. **Use HTTPS only** - All endpoints must use TLS
3. **Store secrets in Key Vault** - Never commit secrets to code
4. **Enable managed identity** - Use system-assigned managed identity for Key Vault
5. **Scope minimization** - Request only minimum required scopes
6. **Token expiration** - Respect token expiration times
7. **Log authentication events** - Track successful/failed authentications
8. **Rate limiting** - Implement rate limiting on auth endpoints

## Testing Authentication

### Test Token Validation

```bash
# Valid token
curl -X POST https://mhpbrandfunctions38e5971a.azurewebsites.net/api/auth/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Response:
# {
#   "valid": true,
#   "authenticated": true,
#   "userId": "...",
#   "tenantId": "...",
#   "scopes": ["access_as_user"]
# }
```

### Test Protected Endpoint

```bash
# With valid token
curl -X POST https://mhpbrandfunctions38e5971a.azurewebsites.net/api/rewrite \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "goals": []}'

# Without token (will return 401)
curl -X POST https://mhpbrandfunctions38e5971a.azurewebsites.net/api/rewrite \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "goals": []}'
```

## Roadmap

### Phase 9 (Current) ✅

- [x] JWT token validation structure
- [x] Bearer token authentication middleware
- [x] `/api/auth/validate` endpoint
- [x] Protected POST route example (`/api/rewrite`)
- [x] Key Vault integration stub
- [x] Authentication documentation

### Phase 9+ (Future)

- [ ] Full JWKS endpoint integration for signature verification
- [ ] Complete Key Vault secrets integration
- [ ] Token revocation checking
- [ ] Refresh token support
- [ ] Multi-tenant token validation
- [ ] Rate limiting on auth endpoints
- [ ] Authentication metrics and alerts
- [ ] Custom authorization policies
- [ ] Role-based access control (RBAC) integration

## References

- [Azure AD Authentication](https://learn.microsoft.com/azure/active-directory/develop/)
- [JWT Token Format](https://jwt.io/)
- [On-Behalf-Of Flow](https://learn.microsoft.com/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow)
- [Nested App Authentication](https://learn.microsoft.com/office/dev/add-ins/develop/sso-in-office-add-ins)
- [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/)
