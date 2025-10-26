import { GraphClient, GraphClientError } from '../graphClient';

const okResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'request-id': 'req-1' }
  });

describe('GraphClient', () => {
  const tokenProvider = async () => 'token';

  it('retries on 429 and respects Retry-After header', async () => {
    const sleeps: number[] = [];
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Too many requests' } }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '2',
            'request-id': 'throttle-1'
          }
        })
      )
      .mockResolvedValueOnce(okResponse({ value: 'success' }));

    const client = new GraphClient({
      getToken: tokenProvider,
      fetchImpl: fetchMock,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      random: () => 0.5
    });

    const result = await client.request<{ value: string }>({ path: '/me' });

    expect(result.value).toBe('success');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleeps).toEqual([2000]);
  });

  it('opens circuit after repeated throttles', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Slow down' } }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const client = new GraphClient({
      getToken: tokenProvider,
      fetchImpl: fetchMock,
      sleep: async () => {
        /* no-op */
      },
      random: () => 0.5,
      circuitBreaker: { failureThreshold: 2, cooldownMs: 60_000 },
      maxRetries: 0
    });

    await expect(client.request({ path: '/me' })).rejects.toThrow(GraphClientError);
    await expect(client.request({ path: '/me' })).rejects.toThrow(GraphClientError);
    await expect(client.request({ path: '/me' })).rejects.toThrow('Graph circuit breaker is open');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('classifies transient errors from network failures', async () => {
    const client = new GraphClient({
      getToken: tokenProvider,
      fetchImpl: () => Promise.reject(new Error('network down')),
      sleep: async () => {
        /* no-op */
      },
      random: () => 0.5,
      maxRetries: 0
    });

    await expect(client.request({ path: '/me' })).rejects.toMatchObject({
      details: { category: 'Transient', httpStatus: 0 }
    });
  });

  it('handles transient 503 and recovers', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Service unavailable' } }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
      .mockResolvedValueOnce(okResponse({ ok: true }));

    const client = new GraphClient({
      getToken: tokenProvider,
      fetchImpl: fetchMock,
      sleep: async () => {
        /* no-op */
      },
      random: () => 0.1
    });

    const result = await client.request<{ ok: boolean }>({ path: '/sites/root' });
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
