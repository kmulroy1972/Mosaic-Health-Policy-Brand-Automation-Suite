import { GraphClient } from '@mhp/shared-brand-core';

import { ThrottleServer } from '../fixtures/throttle-server';

describe('GraphClient throttling (integration)', () => {
  let server: ThrottleServer;
  let baseUrl: string;

  beforeAll(async () => {
    server = new ThrottleServer({
      statusSequence: [429, 429, 200],
      retryAfterSeconds: 1,
      successBody: { ok: true }
    });
    const port = await server.start();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await server.stop();
  });

  it('backs off and eventually succeeds', async () => {
    const delays: number[] = [];
    const client = new GraphClient({
      baseUrl,
      getToken: async () => 'token',
      fetchImpl: fetch,
      sleep: async (ms: number) => {
        delays.push(ms);
      },
      maxRetries: 3,
      baseDelayMs: 100,
      random: () => 0.5
    });

    const response = await client.request<{ ok: boolean }>({ path: '/' });
    expect(response.ok).toBe(true);
    expect(delays.length).toBeGreaterThanOrEqual(2);
  });
});
