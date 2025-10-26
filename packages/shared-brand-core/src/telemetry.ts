import { diag, Span, SpanStatusCode, trace } from '@opentelemetry/api';

import type { FeatureFlagSnapshot, TelemetryEnvelope } from './index';

type Host = TelemetryEnvelope['host'];

export interface TelemetryContext {
  tenantHash: string;
  userHash: string;
  host: Host;
  featureFlags?: FeatureFlagSnapshot;
  operationId?: string;
}

export interface TelemetryAttributes {
  [key: string]: unknown;
}

export interface TelemetrySpan {
  span: Span;
  recordEvent: (eventName: string, attributes?: TelemetryAttributes) => void;
  recordException: (error: unknown, attributes?: TelemetryAttributes) => void;
  end: (result?: 'success' | 'failure', errorCategory?: string) => void;
}

const tracer = trace.getTracer('mhp.brand.core');

type SpanAttributeValue = string | number | boolean;

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const SSN_REGEX = /\b\d{3}-?\d{2}-?\d{4}\b/g;

export function sanitizeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return scrubString(value);
  }
}

export function scrubString(value: string): string {
  const trimmed = value.trim();
  const scrubbed = trimmed
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(SSN_REGEX, '[REDACTED_SSN]');
  if (scrubbed.length > 512) {
    return `${scrubbed.slice(0, 509)}...`;
  }
  return scrubbed;
}

export function sanitizeTelemetryAttributes(input: TelemetryAttributes): TelemetryAttributes {
  const result: TelemetryAttributes = {};

  for (const [key, value] of Object.entries(input ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (key.toLowerCase().includes('url') || /^https?:\/\//i.test(trimmedValue)) {
        result[key] = sanitizeUrl(trimmedValue);
      } else {
        result[key] = scrubString(trimmedValue);
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value
        .map((item, index) => sanitizeTelemetryAttributes({ [String(index)]: item })[String(index)])
        .filter((item) => item !== undefined);
    } else if (typeof value === 'object') {
      result[key] = sanitizeTelemetryAttributes(value as TelemetryAttributes);
    } else {
      result[key] = scrubString(String(value));
    }
  }

  return result;
}

function prepareSpanAttributes(
  attributes: TelemetryAttributes
): Record<string, SpanAttributeValue> {
  const flattened: Record<string, SpanAttributeValue> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      flattened[key] = value;
    } else if (Array.isArray(value)) {
      const sanitised = value
        .map((item) => {
          if (typeof item === 'string') {
            return scrubString(item);
          }
          if (typeof item === 'number' || typeof item === 'boolean') {
            return String(item);
          }
          return scrubString(JSON.stringify(item));
        })
        .join(', ');
      flattened[key] = sanitised;
    } else {
      flattened[key] = scrubString(JSON.stringify(value));
    }
  }
  return flattened;
}

export function startTelemetrySpan(
  name: string,
  context: TelemetryContext,
  attributes: TelemetryAttributes = {}
): TelemetrySpan {
  const baseAttributes = sanitizeTelemetryAttributes(attributes);
  const spanAttributes = prepareSpanAttributes({
    'mhp.tenant': context.tenantHash,
    'mhp.user': context.userHash,
    'mhp.host': context.host,
    'mhp.featureFlags.enablePdfA': context.featureFlags?.enablePdfA ?? true,
    'mhp.featureFlags.allowNonAzureAI': context.featureFlags?.allowNonAzureAI ?? false,
    ...baseAttributes
  });
  const span = tracer.startSpan(name, {
    attributes: spanAttributes
  });

  if (context.operationId) {
    span.setAttribute('mhp.operationId', scrubString(context.operationId));
  }

  return {
    span,
    recordEvent: (eventName, eventAttributes = {}) => {
      const attrs = sanitizeTelemetryAttributes(eventAttributes);
      span.addEvent(eventName, prepareSpanAttributes(attrs));
    },
    recordException: (error, exceptionAttributes = {}) => {
      const details = sanitizeTelemetryAttributes(exceptionAttributes);
      const message = sanitizeError(error);
      span.recordException({ name: 'TelemetryException', message, ...details });
    },
    end: (result = 'success', errorCategory) => {
      if (result === 'failure') {
        span.setStatus({ code: SpanStatusCode.ERROR, message: errorCategory ?? 'failure' });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }
      if (errorCategory) {
        span.setAttribute('mhp.errorCategory', scrubString(errorCategory));
      }
      span.end();
    }
  };
}

export function recordTelemetryEvent(
  name: string,
  context: TelemetryContext,
  attributes: TelemetryAttributes = {}
): TelemetryAttributes {
  const sanitized = sanitizeTelemetryAttributes(attributes);
  const activeSpan = trace.getActiveSpan();

  if (activeSpan) {
    activeSpan.addEvent(name, prepareSpanAttributes(sanitized));
    return sanitized;
  }

  const span = tracer.startSpan(name, {
    attributes: prepareSpanAttributes({
      'mhp.tenant': context.tenantHash,
      'mhp.user': context.userHash,
      'mhp.host': context.host
    })
  });

  try {
    span.addEvent(name, prepareSpanAttributes(sanitized));
  } finally {
    span.end();
  }

  return sanitized;
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return scrubString(error.message);
  }
  return scrubString(String(error ?? 'unknown error'));
}

let nodeCrypto: typeof import('crypto') | null = null;
try {
   
  nodeCrypto = require('crypto');
} catch {
  nodeCrypto = null;
  diag.debug('node:crypto not available; falling back to Web Crypto for hashing.');
}

export async function hashIdentifier(value: string, salt: string): Promise<string> {
  if (!value) {
    return 'anonymous';
  }
  if (!salt) {
    throw new Error('hashIdentifier requires a non-empty salt');
  }

  if (nodeCrypto) {
    return nodeCrypto.createHmac('sha256', salt).update(value).digest('hex');
  }

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(salt),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await window.crypto.subtle.sign('HMAC', key, encoder.encode(value));
    return Array.from(new Uint8Array(signature))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  throw new Error('No crypto implementation available for hashing identifiers');
}

export function scrubTelemetryEnvelope(
  envelope: TelemetryEnvelope,
  details?: TelemetryAttributes
): { envelope: TelemetryEnvelope; details?: TelemetryAttributes } {
  const sanitizedDetails = details ? sanitizeTelemetryAttributes(details) : undefined;
  const sanitizedEnvelope: TelemetryEnvelope = {
    ...envelope,
    tenantHash: scrubString(envelope.tenantHash),
    userHash: scrubString(envelope.userHash),
    correlationId: envelope.correlationId ? scrubString(envelope.correlationId) : undefined,
    errorCategory: envelope.errorCategory ? scrubString(envelope.errorCategory) : undefined
  };

  return { envelope: sanitizedEnvelope, details: sanitizedDetails };
}
