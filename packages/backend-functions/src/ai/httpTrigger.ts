import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import {
  createRewriteTelemetry,
  isAzureOpenAIEndpoint,
  redactSensitiveText,
  validateRewriteRequest,
  type RewriteRequestInput
} from '@mhp/shared-brand-core';

import { rewriteText } from './client';

const ALLOW_NON_AZURE_AI = process.env.ALLOW_NON_AZURE_AI === 'true';
const PII_MODE_ENABLED = process.env.ALLOW_PII_REWRITE === 'true';
const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT ?? '';

export async function rewriteHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  let body: RewriteRequestInput;
  try {
    body = (await request.json()) as RewriteRequestInput;
  } catch (error) {
    context.log('ai_rewrite_invalid_json', redactSensitiveText(String(error ?? 'unknown')));
    return {
      status: 400,
      jsonBody: { error: 'Invalid JSON payload.' }
    };
  }

  const validation = validateRewriteRequest(body);
  if (!validation.ok) {
    return {
      status: 400,
      jsonBody: { error: validation.error }
    };
  }

  const normalized = validation.value;
  const azureEndpoint = isAzureOpenAIEndpoint(OPENAI_ENDPOINT);

  if (normalized.piiMode) {
    if (!PII_MODE_ENABLED) {
      return {
        status: 400,
        jsonBody: { error: 'PII-related rewrites are not permitted.' }
      };
    }
    if (!azureEndpoint) {
      return {
        status: 400,
        jsonBody: { error: 'PII-related rewrites require Azure OpenAI.' }
      };
    }
  }

  if (!ALLOW_NON_AZURE_AI && !azureEndpoint) {
    return {
      status: 400,
      jsonBody: { error: 'Non-Azure AI providers are disabled.' }
    };
  }

  const start = Date.now();

  try {
    const response = await rewriteText(normalized);
    const elapsedMs = Date.now() - start;
    context.log(
      'ai_rewrite_completed',
      createRewriteTelemetry({
        result: 'success',
        elapsedMs,
        piiMode: normalized.piiMode,
        provider: azureEndpoint ? 'azure' : 'other',
        modelId: response.modelId,
        promptTokens: response.tokenUsage?.promptTokens,
        completionTokens: response.tokenUsage?.completionTokens
      })
    );

    return {
      status: 200,
      jsonBody: response
    };
  } catch (error) {
    const elapsedMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    context.log(
      'ai_rewrite_failed',
      createRewriteTelemetry({
        result: 'failure',
        elapsedMs,
        piiMode: normalized.piiMode,
        provider: azureEndpoint ? 'azure' : 'other',
        error: errorMessage
      })
    );
    return {
      status: 502,
      jsonBody: { error: 'Rewrite failed.' }
    };
  }
}
