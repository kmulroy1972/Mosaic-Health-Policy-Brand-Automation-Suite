import { HttpRequest, InvocationContext } from '@azure/functions';

import { healthHttpTrigger } from '../httpTrigger';
import type { HealthCheckResponse } from '../types';

describe('healthHttpTrigger', () => {
  let mockContext: InvocationContext;
  let mockRequest: HttpRequest;

  beforeEach(() => {
    mockContext = {
      log: jest.fn(),
      error: jest.fn()
    } as unknown as InvocationContext;

    mockRequest = {} as HttpRequest;
  });

  it('returns 200 with healthy status when all checks pass', async () => {
    // Set up environment variables for all checks to pass
    process.env.OPENAI_ENDPOINT = 'https://test.openai.azure.com';
    process.env.OPENAI_DEPLOYMENT = 'gpt-4';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.GRAPH_ACCESS_TOKEN = 'test-token';
    process.env.AZURE_STORAGE_CONNECTION_STRING = 'test-connection-string';

    const response = await healthHttpTrigger(mockRequest, mockContext);

    expect(response.status).toBe(200);
    expect(response.jsonBody).toBeDefined();

    const body = response.jsonBody as HealthCheckResponse;
    expect(body.status).toBe('healthy');
    expect(body.version).toBe('0.0.1');
    expect(body.timestamp).toBeDefined();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    expect(body.checks.aiClient).toBe('ok');
    expect(body.checks.graphClient).toBe('ok');
    expect(body.checks.storage).toBe('ok');

    // Clean up
    delete process.env.OPENAI_ENDPOINT;
    delete process.env.OPENAI_DEPLOYMENT;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GRAPH_ACCESS_TOKEN;
    delete process.env.AZURE_STORAGE_CONNECTION_STRING;
  });

  it('returns 200 with degraded status when some checks fail', async () => {
    // Only set up Graph client
    process.env.GRAPH_ACCESS_TOKEN = 'test-token';

    const response = await healthHttpTrigger(mockRequest, mockContext);

    expect(response.status).toBe(200);
    expect(response.jsonBody).toBeDefined();

    const body = response.jsonBody as HealthCheckResponse;
    expect(body.status).toBe('degraded');
    expect(body.checks.aiClient).toBe('unconfigured');
    expect(body.checks.graphClient).toBe('ok');
    expect(body.checks.storage).toBe('unconfigured');

    // Clean up
    delete process.env.GRAPH_ACCESS_TOKEN;
  });

  it('returns 200 with degraded status when all checks fail', async () => {
    // Clear all environment variables
    const originalEnv = { ...process.env };
    delete process.env.OPENAI_ENDPOINT;
    delete process.env.OPENAI_DEPLOYMENT;
    delete process.env.OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_KEY;
    delete process.env.GRAPH_ACCESS_TOKEN;
    delete process.env.AZURE_TENANT_ID;
    delete process.env.AZURE_CLIENT_ID;
    delete process.env.MSI_ENDPOINT;
    delete process.env.AZURE_STORAGE_CONNECTION_STRING;
    delete process.env.AZURE_STORAGE_ACCOUNT_NAME;
    delete process.env.AZURE_STORAGE_ACCOUNT_KEY;

    const response = await healthHttpTrigger(mockRequest, mockContext);

    expect(response.status).toBe(200);
    expect(response.jsonBody).toBeDefined();

    const body = response.jsonBody as HealthCheckResponse;
    expect(body.status).toBe('degraded');
    expect(body.checks.aiClient).toBe('unconfigured');
    expect(body.checks.graphClient).toBe('unconfigured');
    expect(body.checks.storage).toBe('unconfigured');

    // Restore environment
    process.env = originalEnv;
  });

  it('checks alternative environment variables for AI client', async () => {
    process.env.OPENAI_ENDPOINT = 'https://test.openai.azure.com';
    process.env.OPENAI_DEPLOYMENT = 'gpt-4';
    process.env.AZURE_OPENAI_KEY = 'test-key'; // Alternative key
    process.env.GRAPH_ACCESS_TOKEN = 'test-token';
    process.env.AZURE_STORAGE_CONNECTION_STRING = 'test-connection-string';

    const response = await healthHttpTrigger(mockRequest, mockContext);

    expect(response.status).toBe(200);
    const body = response.jsonBody as HealthCheckResponse;
    expect(body.status).toBe('healthy');
    expect(body.checks.aiClient).toBe('ok');

    // Clean up
    delete process.env.OPENAI_ENDPOINT;
    delete process.env.OPENAI_DEPLOYMENT;
    delete process.env.AZURE_OPENAI_KEY;
    delete process.env.GRAPH_ACCESS_TOKEN;
    delete process.env.AZURE_STORAGE_CONNECTION_STRING;
  });

  it('checks alternative environment variables for Graph client', async () => {
    process.env.OPENAI_ENDPOINT = 'https://test.openai.azure.com';
    process.env.OPENAI_DEPLOYMENT = 'gpt-4';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.AZURE_TENANT_ID = 'test-tenant'; // Alternative credential
    process.env.AZURE_STORAGE_CONNECTION_STRING = 'test-connection-string';

    const response = await healthHttpTrigger(mockRequest, mockContext);

    expect(response.status).toBe(200);
    const body = response.jsonBody as HealthCheckResponse;
    expect(body.status).toBe('healthy');
    expect(body.checks.graphClient).toBe('ok');

    // Clean up
    delete process.env.OPENAI_ENDPOINT;
    delete process.env.OPENAI_DEPLOYMENT;
    delete process.env.OPENAI_API_KEY;
    delete process.env.AZURE_TENANT_ID;
    delete process.env.AZURE_STORAGE_CONNECTION_STRING;
  });

  it('checks alternative environment variables for storage', async () => {
    process.env.OPENAI_ENDPOINT = 'https://test.openai.azure.com';
    process.env.OPENAI_DEPLOYMENT = 'gpt-4';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.GRAPH_ACCESS_TOKEN = 'test-token';
    process.env.AZURE_STORAGE_ACCOUNT_NAME = 'test-account';
    process.env.AZURE_STORAGE_ACCOUNT_KEY = 'test-key'; // Alternative storage config

    const response = await healthHttpTrigger(mockRequest, mockContext);

    expect(response.status).toBe(200);
    const body = response.jsonBody as HealthCheckResponse;
    expect(body.status).toBe('healthy');
    expect(body.checks.storage).toBe('ok');

    // Clean up
    delete process.env.OPENAI_ENDPOINT;
    delete process.env.OPENAI_DEPLOYMENT;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GRAPH_ACCESS_TOKEN;
    delete process.env.AZURE_STORAGE_ACCOUNT_NAME;
    delete process.env.AZURE_STORAGE_ACCOUNT_KEY;
  });
});
