import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

interface BrandGuidanceRequest {
  documentText: string;
  formatRules: string;
}

interface BrandGuidanceResponse {
  summary: string;
  violations: string[];
}

const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT ?? '';
const OPENAI_DEPLOYMENT =
  process.env.OPENAI_DEPLOYMENT ?? process.env.OPENAI_MODEL_DEPLOYMENT ?? 'gpt-4o';
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

export async function brandGuidanceAgentHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // Validate request body
  let body: BrandGuidanceRequest;
  try {
    body = (await request.json()) as BrandGuidanceRequest;
  } catch (error) {
    context.log('brand_guidance_invalid_json', String(error ?? 'unknown'));
    return {
      status: 400,
      jsonBody: { error: 'Invalid JSON payload. Expected {documentText, formatRules}.' }
    };
  }

  // Validate required fields
  if (!body.documentText || typeof body.documentText !== 'string') {
    return {
      status: 400,
      jsonBody: { error: 'Missing or invalid documentText field.' }
    };
  }

  if (!body.formatRules || typeof body.formatRules !== 'string') {
    return {
      status: 400,
      jsonBody: { error: 'Missing or invalid formatRules field.' }
    };
  }

  // Check OpenAI configuration
  if (!OPENAI_ENDPOINT || !OPENAI_DEPLOYMENT || !OPENAI_API_KEY) {
    context.error('OpenAI configuration missing');
    return {
      status: 500,
      jsonBody: { error: 'OpenAI service is not configured.' }
    };
  }

  const start = Date.now();

  try {
    // Build the system prompt for brand guidance analysis
    const systemPrompt = `You are a brand compliance analyst. Analyze documents against provided formatting and brand rules. 
Return your analysis as a JSON object with exactly two fields:
- "summary": A brief summary (2-3 sentences) of the overall compliance status
- "violations": An array of specific violation strings found, or an empty array if no violations

Be precise and actionable. Only report actual violations of the provided rules.`;

    // Build the user prompt with document and rules
    const userPrompt = `Document to analyze:
---
${body.documentText}
---

Formatting and brand rules to check against:
---
${body.formatRules}
---

Analyze this document and return a JSON object with "summary" and "violations" fields.`;

    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    };

    // Call Azure OpenAI
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
      let detail = 'Brand guidance analysis failed';
      try {
        const errorPayload = (await response.json()) as { error?: { message?: string } };
        detail = errorPayload.error?.message ?? detail;
      } catch (error) {
        void error;
      }
      context.error(`OpenAI API error: ${detail}`);
      return {
        status: 502,
        jsonBody: { error: 'Brand guidance analysis service unavailable.' }
      };
    }

    const json = (await response.json()) as OpenAIChatCompletion;
    const content = json.choices[0]?.message?.content ?? '';

    // Parse the JSON response
    let result: BrandGuidanceResponse;
    try {
      result = JSON.parse(content) as BrandGuidanceResponse;

      // Validate response structure
      if (!result.summary || !Array.isArray(result.violations)) {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      context.error(`Failed to parse AI response: ${String(error)}`);
      return {
        status: 502,
        jsonBody: { error: 'Invalid response from analysis service.' }
      };
    }

    const elapsedMs = Date.now() - start;
    context.log('brand_guidance_completed', {
      elapsedMs,
      violationsCount: result.violations.length,
      tokenUsage: json.usage
    });
    void elapsedMs; // Logged for telemetry

    return {
      status: 200,
      jsonBody: result,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    const _elapsedMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    context.error(`Brand guidance failed: ${errorMessage}`);
    void _elapsedMs; // Available for future telemetry

    return {
      status: 500,
      jsonBody: { error: 'Brand guidance analysis failed.' }
    };
  }
}
