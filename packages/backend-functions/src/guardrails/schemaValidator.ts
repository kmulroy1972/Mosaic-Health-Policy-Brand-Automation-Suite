/**
 * Hallucination guardrails & schema validation
 */

export interface JSONSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
}

export function validateJSONSchema(
  data: unknown,
  schema: JSONSchema
): { valid: boolean; errors?: string[] } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Data is not an object'] };
  }

  const obj = data as Record<string, unknown>;
  const errors: string[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in obj)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  // Validate properties
  for (const [key] of Object.entries(obj)) {
    if (!(key in schema.properties)) {
      errors.push(`Unknown property: ${key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

export function createBrandGuidanceSchema(): JSONSchema {
  return {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      violations: { type: 'array' }
    },
    required: ['summary', 'violations']
  };
}
