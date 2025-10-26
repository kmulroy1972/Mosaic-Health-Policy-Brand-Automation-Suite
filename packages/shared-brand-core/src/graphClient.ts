type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type GraphErrorCategory = 'Throttled' | 'Transient' | 'Auth' | 'Permanent';

export interface GraphErrorDetails {
  category: GraphErrorCategory;
  httpStatus: number;
  retryAfterMs?: number;
  correlationId?: string | null;
}

export class GraphClientError extends Error {
  public readonly details: GraphErrorDetails;

  constructor(message: string, details: GraphErrorDetails) {
    super(message);
    this.name = 'GraphClientError';
    this.details = details;
  }
}

export interface GraphClientConfig {
  getToken: () => Promise<string>;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  circuitBreaker?: {
    failureThreshold: number;
    cooldownMs: number;
  };
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
  defaultHeaders?: Record<string, string>;
  userAgent?: string;
}

export interface GraphRequestOptions {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | undefined>;
  retries?: number;
  parseJson?: boolean;
}

interface CircuitBreakerState {
  failureCount: number;
  openUntil: number;
}

export interface GraphBatchRequest {
  method: HttpMethod;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  id?: string;
}

export interface GraphBatchResponseItem<T = unknown> {
  id: string;
  status: number;
  headers?: Record<string, string>;
  body?: T;
}

export interface GraphBatchResponse<T = unknown> {
  responses: Array<GraphBatchResponseItem<T>>;
}

export interface DriveDeltaOptions<T> {
  driveId: string;
  token?: string;
  select?: string;
  mapItem: (item: DriveItem) => T;
}

export interface DriveDeltaResult<T> {
  items: T[];
  removedIds: string[];
  deltaToken: string;
}

export interface DriveItem {
  id: string;
  name?: string;
  file?: unknown;
  folder?: unknown;
  webUrl?: string;
  lastModifiedDateTime?: string;
  eTag?: string;
  parentReference?: {
    driveId?: string;
    id?: string;
    path?: string;
  };
  [key: string]: unknown;
}

const DEFAULT_BASE_URL = 'https://graph.microsoft.com/v1.0';
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 15_000;
const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_COOLDOWN_MS = 30_000;

export class GraphClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly getToken: GraphClientConfig['getToken'];
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly random: () => number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly userAgent?: string;
  private readonly circuitBreaker: {
    failureThreshold: number;
    cooldownMs: number;
  };

  private circuit: CircuitBreakerState = {
    failureCount: 0,
    openUntil: 0
  };

  constructor(config: GraphClientConfig) {
    this.getToken = config.getToken;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseDelayMs = config.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
    this.maxDelayMs = config.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
    this.sleep = config.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.random = config.random ?? Math.random;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.userAgent = config.userAgent;
    this.circuitBreaker = config.circuitBreaker ?? {
      failureThreshold: DEFAULT_FAILURE_THRESHOLD,
      cooldownMs: DEFAULT_COOLDOWN_MS
    };
  }

  public async request<T = unknown>(options: GraphRequestOptions): Promise<T> {
    const method = options.method ?? 'GET';
    const retries = options.retries ?? this.maxRetries;
    const parseJson = options.parseJson ?? true;

    if (this.isCircuitOpen()) {
      throw new GraphClientError('Graph circuit breaker is open', {
        category: 'Throttled',
        httpStatus: 429,
        retryAfterMs: Math.max(0, this.circuit.openUntil - Date.now())
      });
    }

    const url = this.buildUrl(options.path, options.query);

    let attempt = 0;
    let lastError: GraphClientError | null = null;

    while (attempt <= retries) {
      try {
        const token = await this.getToken();
        const serializedBody = this.serializeBody(options.body);
        const response = await this.fetchImpl(url, {
          method,
          headers: this.buildHeaders(token, options.headers, serializedBody),
          body: serializedBody
        });

        if (response.ok) {
          this.resetCircuit();
          if (!parseJson || response.status === 204) {
            return undefined as T;
          }
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            return undefined as T;
          }
          return (await response.json()) as T;
        }

        const error = await this.toGraphError(response);
        if (!this.shouldRetry(error) || attempt === retries) {
          this.recordFailure(error);
          throw error;
        }

        this.recordFailure(error);
        const delay = this.calculateDelay(error, attempt);
        await this.sleep(delay);
      } catch (error) {
        if (error instanceof GraphClientError) {
          lastError = error;
        } else {
          const graphError = this.fromNetworkError(error);
          if (!this.shouldRetry(graphError) || attempt === retries) {
            this.recordFailure(graphError);
            throw graphError;
          }
          this.recordFailure(graphError);
          const delay = this.calculateDelay(graphError, attempt);
          await this.sleep(delay);
          lastError = graphError;
        }
      }

      attempt += 1;
    }

    throw (
      lastError ??
      new GraphClientError('Graph request failed', {
        category: 'Transient',
        httpStatus: 0
      })
    );
  }

  public createBatchBuilder(concurrencyLimit = 4): GraphBatchBuilder {
    return new GraphBatchBuilder(this, concurrencyLimit);
  }

  public async fetchDriveDelta<T>(options: DriveDeltaOptions<T>): Promise<DriveDeltaResult<T>> {
    if (!options.driveId) {
      throw new Error('driveId is required');
    }

    let path = `/drives/${options.driveId}/root/delta`;
    if (options.token) {
      path += `?token=${encodeURIComponent(options.token)}`;
    } else if (options.select) {
      path += `?$select=${encodeURIComponent(options.select)}`;
    }

    const items: T[] = [];
    const removedIds: string[] = [];
    let deltaToken: string | undefined;

    // Delta endpoints may return absolute next links.
    let nextLink: string | undefined = this.buildUrl(path);

    while (nextLink) {
      const response: DeltaResponse = await this.request<DeltaResponse>({
        path: nextLink,
        method: 'GET'
      });

      for (const entry of response.value ?? []) {
        if (entry['@removed']) {
          if (entry.id) {
            removedIds.push(entry.id);
          }
          continue;
        }
        items.push(options.mapItem(entry));
      }

      if (response['@odata.nextLink']) {
        nextLink = response['@odata.nextLink'];
      } else {
        nextLink = undefined;
        deltaToken = response['@delta.token'] ?? response['@odata.deltaLink'] ?? deltaToken;
      }
    }

    if (!deltaToken) {
      throw new Error('Delta response missing @delta.token');
    }

    return {
      items,
      removedIds,
      deltaToken
    };
  }

  private buildUrl(path: string, query?: GraphRequestOptions['query']): string {
    if (/^https?:/i.test(path)) {
      return this.appendQuery(path, query);
    }
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return this.appendQuery(`${this.baseUrl}${normalized}`, query);
  }

  private appendQuery(url: string, query?: GraphRequestOptions['query']): string {
    if (!query || Object.keys(query).length === 0) {
      return url;
    }
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${searchParams.toString()}`;
  }

  private buildHeaders(
    token: string,
    headers?: Record<string, string>,
    body?: BodyInit | null
  ): HeadersInit {
    const finalHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...this.defaultHeaders,
      ...headers
    };
    if (this.userAgent) {
      finalHeaders['User-Agent'] = this.userAgent;
    }
    if (body && !finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }
    if (!body && finalHeaders['Content-Type'] && !headers?.['Content-Type']) {
      delete finalHeaders['Content-Type'];
    }
    return finalHeaders;
  }

  private serializeBody(body: unknown): BodyInit | undefined {
    if (body === undefined || body === null) {
      return undefined;
    }
    if (typeof body === 'string' || body instanceof Blob || body instanceof ArrayBuffer) {
      return body as BodyInit;
    }
    return JSON.stringify(body);
  }

  private async toGraphError(response: Response): Promise<GraphClientError> {
    const retryAfter = this.parseRetryAfter(response.headers.get('retry-after'));
    const correlationId =
      response.headers.get('request-id') ?? response.headers.get('client-request-id');
    let message = `Graph request failed with status ${response.status}`;

    try {
      const json = await response.json();
      if (json?.error?.message) {
        message = json.error.message;
      }
    } catch {
      // ignore parse errors
    }

    const details: GraphErrorDetails = {
      category: this.categorizeStatus(response.status),
      httpStatus: response.status,
      retryAfterMs: retryAfter ?? undefined,
      correlationId
    };

    return new GraphClientError(message, details);
  }

  private categorizeStatus(status: number): GraphErrorCategory {
    if (status === 401 || status === 403) {
      return 'Auth';
    }
    if (status === 429) {
      return 'Throttled';
    }
    if (status >= 500 && status < 600) {
      return 'Transient';
    }
    return 'Permanent';
  }

  private shouldRetry(error: GraphClientError): boolean {
    return error.details.category === 'Throttled' || error.details.category === 'Transient';
  }

  private calculateDelay(error: GraphClientError, attempt: number): number {
    if (error.details.retryAfterMs && error.details.retryAfterMs > 0) {
      return error.details.retryAfterMs;
    }
    const exponential = Math.min(this.baseDelayMs * 2 ** attempt, this.maxDelayMs);
    return Math.floor(this.random() * exponential);
  }

  private parseRetryAfter(retryAfter: string | null): number | null {
    if (!retryAfter) {
      return null;
    }
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds)) {
      return seconds * 1000;
    }
    const retryDate = Date.parse(retryAfter);
    if (Number.isNaN(retryDate)) {
      return null;
    }
    return Math.max(0, retryDate - Date.now());
  }

  private fromNetworkError(error: unknown): GraphClientError {
    const message = error instanceof Error ? error.message : 'Network error';
    return new GraphClientError(message, {
      category: 'Transient',
      httpStatus: 0
    });
  }

  private isCircuitOpen(): boolean {
    if (this.circuit.openUntil === 0) {
      return false;
    }
    if (Date.now() >= this.circuit.openUntil) {
      this.resetCircuit();
      return false;
    }
    return true;
  }

  private recordFailure(error: GraphClientError): void {
    if (error.details.category === 'Throttled' || error.details.category === 'Transient') {
      this.circuit.failureCount += 1;
      if (this.circuit.failureCount >= this.circuitBreaker.failureThreshold) {
        this.circuit.openUntil = Date.now() + this.circuitBreaker.cooldownMs;
      }
    }
  }

  private resetCircuit(): void {
    this.circuit.failureCount = 0;
    this.circuit.openUntil = 0;
  }
}

export class GraphBatchBuilder {
  private readonly client: GraphClient;
  private readonly concurrencyLimit: number;
  private readonly requests: GraphBatchRequest[] = [];

  constructor(client: GraphClient, concurrencyLimit: number) {
    this.client = client;
    this.concurrencyLimit = Math.max(1, concurrencyLimit);
  }

  public add(request: GraphBatchRequest): string {
    const id = request.id ?? `${this.requests.length + 1}`;
    this.requests.push({ ...request, id });
    return id;
  }

  public async execute<T = unknown>(): Promise<Array<GraphBatchResponseItem<T>>> {
    const results: Array<GraphBatchResponseItem<T>> = [];
    const chunks = this.chunkRequests(this.requests, this.concurrencyLimit);

    for (const chunk of chunks) {
      const payload = {
        requests: chunk.map((request) => ({
          id: request.id,
          method: request.method,
          url: request.url.startsWith('/') ? request.url.substring(1) : request.url,
          headers: request.headers,
          body: request.body
        }))
      };

      const response = await this.client.request<GraphBatchResponse<T>>({
        path: '$batch',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      results.push(...(response.responses ?? []));
    }

    return results;
  }

  private chunkRequests<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }
    return result;
  }
}

interface DeltaResponse {
  value?: DriveItem[];
  '@odata.nextLink'?: string;
  '@odata.deltaLink'?: string;
  '@delta.token'?: string;
}
