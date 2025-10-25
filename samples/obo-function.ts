import { OnBehalfOfCredential } from '@azure/identity';

type Logger = {
  (message?: unknown, ...optional: unknown[]): void;
};

type FunctionContext = {
  log: Logger & { warn: Logger; error: Logger };
  invocationId: string;
  res?: {
    status: number;
    body: unknown;
  };
};

type HttpRequest = {
  headers: Record<string, string | undefined>;
};

const graphDefaultScope = 'https://graph.microsoft.com/.default';

/**
 * Demonstrates an HTTP-triggered Azure Function performing an OBO exchange.
 * Assumes the inbound Authorization header contains a bearer token acquired via NAA.
 */
export async function run(context: FunctionContext, req: HttpRequest): Promise<void> {
  const authHeader = req.headers['authorization'] ?? req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    context.res = {
      status: 401,
      body: { error: 'missing_bearer_token' }
    };
    return;
  }

  const userAssertion = authHeader.slice('Bearer '.length);

  const credential = new OnBehalfOfCredential({
    tenantId: process.env.TENANT_ID ?? '',
    clientId: process.env.CONFIDENTIAL_CLIENT_ID ?? '',
    clientSecret: process.env.CONFIDENTIAL_CLIENT_SECRET ?? '',
    userAssertionToken: userAssertion
  });

  try {
    const accessToken = await credential.getToken(graphDefaultScope);

    context.log('Graph token acquired via OBO', {
      expiresOnTimestamp: accessToken?.expiresOnTimestamp ?? null
    });

    context.res = {
      status: 200,
      body: {
        status: 'obo_success',
        expiresOn: accessToken?.expiresOnTimestamp ?? null,
        correlationId: context.invocationId
      }
    };
  } catch (error) {
    context.log.error('OBO exchange failed', error);
    context.res = {
      status: 500,
      body: {
        error: 'obo_exchange_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        correlationId: context.invocationId
      }
    };
  }
}
