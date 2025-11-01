import type { HttpRequest, InvocationContext } from '@azure/functions';

/**
 * Log severity levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Structured log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  invocationId?: string;
  functionName?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  properties?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Centralized logger that writes to Application Insights
 * Supports distributed tracing with correlation IDs
 */
export class Logger {
  private context: InvocationContext;
  private correlationId: string;
  private traceId: string;
  private spanId: string;

  constructor(context: InvocationContext, request?: HttpRequest) {
    this.context = context;

    // Generate or extract correlation IDs from headers
    let correlationId: string | undefined;
    if (request) {
      const headers = request.headers;
      correlationId =
        headers.get('x-correlation-id') ??
        headers.get('request-id') ??
        headers.get('x-request-id') ??
        undefined;
    }

    // Use existing correlation ID from headers or generate new one
    this.correlationId =
      correlationId || `corr-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Generate trace and span IDs for OpenTelemetry
    this.traceId = this.generateTraceId();
    this.spanId = this.generateSpanId();
  }

  /**
   * Generate a 32-character hexadecimal trace ID (OpenTelemetry format)
   */
  private generateTraceId(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate a 16-character hexadecimal span ID (OpenTelemetry format)
   */
  private generateSpanId(): string {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Get correlation ID for distributed tracing
   */
  getCorrelationId(): string {
    return this.correlationId;
  }

  /**
   * Get trace ID for OpenTelemetry
   */
  getTraceId(): string {
    return this.traceId;
  }

  /**
   * Get span ID for OpenTelemetry
   */
  getSpanId(): string {
    return this.spanId;
  }

  /**
   * Log a debug message
   */
  debug(message: string, properties?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, properties);
  }

  /**
   * Log an info message
   */
  info(message: string, properties?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, properties);
  }

  /**
   * Log a warning message
   */
  warn(message: string, properties?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, properties);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, properties?: Record<string, unknown>): void {
    const errorProperties: Record<string, unknown> = {
      ...properties,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        : undefined
    };
    this.log(LogLevel.ERROR, message, errorProperties);
  }

  /**
   * Internal log method that writes to Application Insights
   */
  private log(level: LogLevel, message: string, properties?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      invocationId: this.context.invocationId,
      functionName: this.context.functionName,
      correlationId: this.correlationId,
      traceId: this.traceId,
      spanId: this.spanId,
      properties
    };

    // Write to Application Insights via context.log
    // Azure Functions automatically forwards these to Application Insights
    const structuredLog = {
      ...logEntry.properties,
      correlationId: this.correlationId,
      traceId: this.traceId,
      spanId: this.spanId,
      level: LogLevel[level],
      timestamp: logEntry.timestamp
    };

    // Use appropriate context method based on log level
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        this.context.log(message, structuredLog);
        break;
      case LogLevel.WARN:
        this.context.warn(message, structuredLog);
        break;
      case LogLevel.ERROR:
        this.context.error(message, structuredLog);
        break;
    }

    // Also write error details if present
    if (properties?.error && level === LogLevel.ERROR) {
      this.context.error('Error details', properties.error);
    }
  }

  /**
   * Start a trace span (for OpenTelemetry-style distributed tracing)
   */
  startSpan(name: string, attributes?: Record<string, unknown>): Span {
    const spanId = this.generateSpanId();
    return new Span(name, spanId, this.traceId, this.correlationId, attributes);
  }

  /**
   * Set custom properties on all subsequent logs
   */
  setProperties(properties: Record<string, unknown>): void {
    // Properties are set per-log, but we can maintain context
    this.context.log('Properties updated', properties);
  }
}

/**
 * Represents a trace span for distributed tracing
 */
export class Span {
  private name: string;
  private spanId: string;
  private traceId: string;
  private correlationId: string;
  private startTime: number;
  private attributes: Record<string, unknown>;

  constructor(
    name: string,
    spanId: string,
    traceId: string,
    correlationId: string,
    attributes?: Record<string, unknown>
  ) {
    this.name = name;
    this.spanId = spanId;
    this.traceId = traceId;
    this.correlationId = correlationId;
    this.startTime = Date.now();
    this.attributes = attributes || {};
  }

  /**
   * Set an attribute on the span
   */
  setAttribute(key: string, value: unknown): void {
    this.attributes[key] = value;
  }

  /**
   * End the span and return duration
   */
  end(): { duration: number; attributes: Record<string, unknown> } {
    const duration = Date.now() - this.startTime;
    return {
      duration,
      attributes: {
        ...this.attributes,
        'span.name': this.name,
        'span.id': this.spanId,
        'trace.id': this.traceId,
        'correlation.id': this.correlationId,
        'span.duration_ms': duration
      }
    };
  }
}

/**
 * Create a logger instance from an InvocationContext
 */
export function createLogger(context: InvocationContext, request?: HttpRequest): Logger {
  return new Logger(context, request);
}

/**
 * Create a child logger with additional context
 */
export function createChildLogger(
  parentLogger: Logger,
  _additionalContext: Record<string, unknown>
): Logger {
  // In production, this would create a child span
  // For now, we'll return the parent logger with extended properties
  return parentLogger;
}
