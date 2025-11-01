import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { extractTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { validateToken } from './tokenValidator';

/**
 * Authentication configuration
 */
export interface AuthConfig {
  requireAuth: boolean;
  allowedScopes?: string[];
  allowAnonymous?: boolean;
}

/**
 * Authenticated request context
 */
export interface AuthenticatedContext {
  userId?: string;
  tenantId?: string;
  scopes: string[];
  token: string;
  isAuthenticated: boolean;
}

/**
 * Authentication middleware for Azure Functions
 * Validates JWT tokens from Entra ID / Azure AD
 */
export async function authenticateRequest(
  request: HttpRequest,
  context: InvocationContext,
  config: AuthConfig = { requireAuth: true }
): Promise<{ authenticated: boolean; context?: AuthenticatedContext; error?: HttpResponseInit }> {
  const logger = createLogger(context, request);
  const traceContext = extractTraceContext(request);

  // Check for Authorization header
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

  if (!authHeader) {
    if (config.allowAnonymous) {
      logger.debug('No authorization header, allowing anonymous access');
      return { authenticated: true, context: { isAuthenticated: false, scopes: [], token: '' } };
    }

    logger.warn('Missing authorization header', {
      method: request.method,
      url: request.url,
      correlationId: traceContext.correlationId
    });

    return {
      authenticated: false,
      error: {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: 'Missing authorization header. Provide a Bearer token.'
        },
        headers: {
          'WWW-Authenticate': 'Bearer'
        }
      }
    };
  }

  // Extract Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Invalid authorization header format', {
      correlationId: traceContext.correlationId
    });
    return {
      authenticated: false,
      error: {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: 'Invalid authorization header format. Expected: Bearer <token>'
        },
        headers: {
          'WWW-Authenticate': 'Bearer'
        }
      }
    };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  // Validate token
  try {
    const validationResult = await validateToken(token, context);

    if (!validationResult.valid) {
      logger.warn('Token validation failed', {
        reason: validationResult.error,
        correlationId: traceContext.correlationId
      });

      return {
        authenticated: false,
        error: {
          status: 401,
          jsonBody: {
            error: 'Unauthorized',
            message: validationResult.error || 'Token validation failed'
          }
        }
      };
    }

    // Check required scopes
    if (config.allowedScopes && config.allowedScopes.length > 0) {
      const hasRequiredScope = config.allowedScopes.some((scope) =>
        validationResult.scopes?.includes(scope)
      );

      if (!hasRequiredScope) {
        logger.warn('Insufficient scopes', {
          required: config.allowedScopes,
          provided: validationResult.scopes,
          correlationId: traceContext.correlationId
        });

        return {
          authenticated: false,
          error: {
            status: 403,
            jsonBody: {
              error: 'Forbidden',
              message:
                'Insufficient permissions. Required scopes: ' + config.allowedScopes.join(', ')
            }
          }
        };
      }
    }

    logger.info('Authentication successful', {
      userId: validationResult.userId,
      tenantId: validationResult.tenantId,
      scopes: validationResult.scopes,
      correlationId: traceContext.correlationId
    });

    return {
      authenticated: true,
      context: {
        userId: validationResult.userId,
        tenantId: validationResult.tenantId,
        scopes: validationResult.scopes || [],
        token,
        isAuthenticated: true
      }
    };
  } catch (error) {
    logger.error(
      'Authentication error',
      error instanceof Error ? error : new Error(String(error)),
      {
        correlationId: traceContext.correlationId
      }
    );

    return {
      authenticated: false,
      error: {
        status: 500,
        jsonBody: {
          error: 'Internal Server Error',
          message: 'Authentication failed due to an internal error'
        }
      }
    };
  }
}

/**
 * Wrapper middleware that requires authentication for HTTP triggers
 */
export function requireAuth<T extends HttpRequest>(
  handler: (
    request: T,
    context: InvocationContext,
    authContext: AuthenticatedContext
  ) => Promise<HttpResponseInit>,
  config: AuthConfig = { requireAuth: true }
) {
  return async (request: T, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticateRequest(request, context, config);

    if (!authResult.authenticated || !authResult.context) {
      return (
        authResult.error || {
          status: 401,
          jsonBody: { error: 'Unauthorized' }
        }
      );
    }

    return await handler(request, context, authResult.context);
  };
}

/**
 * Get Azure Key Vault secret (using managed identity)
 */
export async function getSecretFromKeyVault(secretName: string): Promise<string | null> {
  // In production, use @azure/keyvault-secrets with managed identity
  // For now, return from environment variables as fallback
  const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL;
  if (!keyVaultUrl) {
    // Fallback to environment variables
    return process.env[secretName] || null;
  }

  try {
    // TODO: Implement actual Key Vault integration
    // const { SecretClient } = require('@azure/keyvault-secrets');
    // const { DefaultAzureCredential } = require('@azure/identity');
    // const credential = new DefaultAzureCredential();
    // const client = new SecretClient(keyVaultUrl, credential);
    // const secret = await client.getSecret(secretName);
    // return secret.value;

    // For now, return null to indicate Key Vault is configured but not implemented
    return null;
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName} from Key Vault:`, error);
    // Fallback to environment variable
    return process.env[secretName] || null;
  }
}
