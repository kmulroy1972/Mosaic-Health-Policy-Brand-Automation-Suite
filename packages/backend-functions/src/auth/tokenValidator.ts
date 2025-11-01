import type { InvocationContext } from '@azure/functions';

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  tenantId?: string;
  scopes?: string[];
  error?: string;
  claims?: Record<string, unknown>;
}

/**
 * Validates JWT tokens from Entra ID / Azure AD
 * In production, should use @azure/msal-node or jose library
 */
export async function validateToken(
  token: string,
  context: InvocationContext
): Promise<TokenValidationResult> {
  try {
    // Basic token structure validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: 'Invalid token format. Expected JWT format.'
      };
    }

    // Decode JWT header and payload (without verification - for structure only)
    // In production, use proper JWT library like jose or jsonwebtoken
    let payload: Record<string, unknown>;

    try {
      // Header decoded but not used currently (would be needed for signature verification)
      JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
      payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    } catch {
      return {
        valid: false,
        error: 'Failed to decode token. Invalid base64 encoding.'
      };
    }

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && typeof payload.exp === 'number' && payload.exp < now) {
      return {
        valid: false,
        error: 'Token has expired.'
      };
    }

    // Check token not before
    if (payload.nbf && typeof payload.nbf === 'number' && payload.nbf > now) {
      return {
        valid: false,
        error: 'Token not yet valid.'
      };
    }

    // Extract user and tenant information
    const userId = (payload.oid as string) || (payload.sub as string) || undefined;
    const tenantId =
      (payload.tid as string) || (payload.iss as string)?.match(/https:\/\/[^/]+\/([^/]+)/)?.[1];

    // Extract scopes
    const scopes = extractScopes(payload);

    // In production, verify token signature and issuer
    // For now, we'll do basic structure validation
    // TODO: Implement proper signature verification using JWKS endpoint
    const issuer = payload.iss as string | undefined;

    if (issuer && !issuer.startsWith('https://login.microsoftonline.com/')) {
      context.warn('Unexpected token issuer', issuer);
    }

    return {
      valid: true,
      userId,
      tenantId,
      scopes,
      claims: payload
    };
  } catch (error) {
    context.error('Token validation error', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Token validation failed'
    };
  }
}

/**
 * Extract scopes from token payload
 */
function extractScopes(payload: Record<string, unknown>): string[] {
  const scopes: string[] = [];

  // Check 'scp' claim (space-separated scopes)
  if (payload.scp && typeof payload.scp === 'string') {
    scopes.push(...payload.scp.split(' '));
  }

  // Check 'roles' claim (array of role names)
  if (payload.roles && Array.isArray(payload.roles)) {
    scopes.push(...(payload.roles as string[]));
  }

  // Check 'scope' claim (alternative format)
  if (payload.scope && typeof payload.scope === 'string') {
    scopes.push(...payload.scope.split(' '));
  }

  // Remove duplicates and empty strings
  return [...new Set(scopes.filter((s) => s.length > 0))];
}
