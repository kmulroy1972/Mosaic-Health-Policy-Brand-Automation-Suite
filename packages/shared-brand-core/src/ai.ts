export const rewriteGoalOptions = ['concise', 'formal', 'lay-audience'] as const;
export type RewriteGoal = (typeof rewriteGoalOptions)[number];

export const rewriteToneOptions = ['neutral', 'professional'] as const;
export type RewriteTone = (typeof rewriteToneOptions)[number];

export interface RewriteRequestInput {
  text: string;
  goal?: RewriteGoal[];
  tone?: RewriteTone[];
  brandTerms?: string[];
  piiMode?: boolean;
}

export interface RewriteRequest {
  text: string;
  goal: RewriteGoal[];
  tone: RewriteTone[];
  brandTerms: string[];
  piiMode: boolean;
}

export interface RewriteResponse {
  text: string;
  modelId: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface RewriteTelemetry {
  result: 'success' | 'failure';
  elapsedMs: number;
  piiMode: boolean;
  provider: 'azure' | 'other';
  modelId?: string;
  promptTokens?: number;
  completionTokens?: number;
  error?: string;
}

export function validateRewriteRequest(
  payload: RewriteRequestInput
): { ok: true; value: RewriteRequest } | { ok: false; error: string } {
  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
  if (!text) {
    return { ok: false, error: 'Text is required.' };
  }

  const goal = normalizeStringArray(payload.goal, rewriteGoalOptions);
  const tone = normalizeStringArray(payload.tone, rewriteToneOptions);
  const brandTerms = normalizeBrandTerms(payload.brandTerms);
  const piiMode = Boolean(payload.piiMode);

  return {
    ok: true,
    value: {
      text,
      goal,
      tone,
      brandTerms,
      piiMode
    }
  };
}

export function isAzureOpenAIEndpoint(endpoint: string): boolean {
  if (!endpoint) {
    return false;
  }
  try {
    const url = new URL(endpoint);
    return /\.openai\.azure\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function redactSensitiveText(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[REDACTED_SSN]');
}

export function createRewriteTelemetry(meta: RewriteTelemetry): RewriteTelemetry {
  const base: RewriteTelemetry = {
    ...meta,
    error: meta.error ? redactSensitiveText(meta.error) : undefined,
    promptTokens: meta.promptTokens ?? 0,
    completionTokens: meta.completionTokens ?? 0
  };
  return base;
}

function normalizeStringArray<T extends string>(
  values: T[] | undefined,
  allowed: ReadonlyArray<T>
): T[] {
  if (!Array.isArray(values)) {
    return [];
  }
  const allowedSet = new Set(allowed);
  const result: T[] = [];
  for (const value of values) {
    if (allowedSet.has(value) && !result.includes(value)) {
      result.push(value);
    }
  }
  return result;
}

function normalizeBrandTerms(terms: string[] | undefined): string[] {
  if (!Array.isArray(terms)) {
    return [];
  }
  return Array.from(
    new Set(terms.map((term) => term.trim()).filter((term) => term.length > 0 && term.length <= 60))
  );
}
