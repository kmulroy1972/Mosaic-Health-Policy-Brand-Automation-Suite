import { validateRewriteRequest } from './ai';
import type { RewriteRequestInput, RewriteResponse } from './ai';

export interface SubmitRewriteOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
  headers?: Record<string, string>;
}

export async function submitRewriteRequest(
  payload: RewriteRequestInput,
  options: SubmitRewriteOptions = {}
): Promise<RewriteResponse> {
  const validation = validateRewriteRequest(payload);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const endpoint = options.endpoint ?? '/api/ai/rewrite';

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(validation.value)
  });

  if (!response.ok) {
    let detail = 'Rewrite request failed.';
    try {
      const errorPayload = (await response.json()) as { error?: string };
      if (errorPayload.error) {
        detail = errorPayload.error;
      }
    } catch (error) {
      void error;
    }
    throw new Error(detail);
  }

  return (await response.json()) as RewriteResponse;
}
