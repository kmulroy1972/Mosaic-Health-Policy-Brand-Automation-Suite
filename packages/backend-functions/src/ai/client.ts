import type { RewriteRequest, RewriteResponse } from '@mhp/shared-brand-core';

import { buildSystemPrompt } from './prompt';

const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT ?? '';
const OPENAI_DEPLOYMENT = process.env.OPENAI_DEPLOYMENT ?? '';
const OPENAI_API_VERSION = process.env.OPENAI_API_VERSION ?? '2024-02-01';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? process.env.AZURE_OPENAI_KEY ?? '';

interface OpenAIChatCompletion {
  choices: Array<{
    message: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  id: string;
}

export async function rewriteText(request: RewriteRequest): Promise<RewriteResponse> {
  const systemPrompt = buildSystemPrompt(request.brandTerms);
  const userPrompt = buildUserPrompt(request);
  const payload = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.4,
    top_p: 0.95,
    max_tokens: 600,
    response_format: { type: 'text' }
  };

  if (!OPENAI_ENDPOINT || !OPENAI_DEPLOYMENT || !OPENAI_API_KEY) {
    throw new Error('OpenAI configuration missing');
  }

  const response = await fetch(
    `${OPENAI_ENDPOINT}/openai/deployments/${OPENAI_DEPLOYMENT}/chat/completions?api-version=${OPENAI_API_VERSION}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': OPENAI_API_KEY
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    let detail = 'AI rewrite failed';
    try {
      const errorPayload = (await response.json()) as { error?: { message?: string } };
      detail = errorPayload.error?.message ?? detail;
    } catch (error) {
      // swallow JSON parse errors to avoid masking original failure
      void error;
    }
    throw new Error(detail);
  }

  const json = (await response.json()) as OpenAIChatCompletion;
  const text = json.choices[0]?.message?.content ?? '';

  return {
    text,
    modelId: json.id,
    tokenUsage: json.usage
      ? {
          promptTokens: json.usage.prompt_tokens,
          completionTokens: json.usage.completion_tokens
        }
      : undefined
  };
}

function buildUserPrompt(request: RewriteRequest): string {
  const sections: string[] = [];
  if (request.goal?.length) {
    sections.push(`Goals: ${request.goal.join(', ')}`);
  }
  if (request.tone?.length) {
    sections.push(`Preferred tone: ${request.tone.join(', ')}`);
  }
  sections.push('---');
  sections.push(request.text);
  return sections.join('\n');
}
