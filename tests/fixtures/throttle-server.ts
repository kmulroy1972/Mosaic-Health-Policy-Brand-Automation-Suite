import http from 'http';

export interface ThrottleScenario {
  statusSequence: number[];
  retryAfterSeconds?: number;
  successBody?: Record<string, unknown>;
}

export class ThrottleServer {
  private server: http.Server | null = null;
  private readonly scenario: ThrottleScenario;
  private readonly port: number;
  private callCount = 0;

  constructor(scenario: ThrottleScenario, port: number = 0) {
    this.scenario = scenario;
    this.port = port;
  }

  public async start(): Promise<number> {
    if (this.server) {
      return this.getPort();
    }

    await new Promise<void>((resolve) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res));
      this.server.listen(this.port, resolve);
    });

    return this.getPort();
  }

  public async stop(): Promise<void> {
    if (!this.server) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      this.server?.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    this.server = null;
    this.callCount = 0;
  }

  public reset(): void {
    this.callCount = 0;
  }

  private handleRequest(
    _req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage>
  ): void {
    const status = this.getNextStatus();
    if (status === 200) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.scenario.successBody ?? { ok: true }));
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.scenario.retryAfterSeconds) {
      headers['Retry-After'] = String(this.scenario.retryAfterSeconds);
    }
    res.writeHead(status, headers);
    res.end(JSON.stringify({ error: { message: `Synthetic status ${status}` } }));
  }

  private getNextStatus(): number {
    const status =
      this.scenario.statusSequence[
        Math.min(this.callCount, this.scenario.statusSequence.length - 1)
      ];
    this.callCount += 1;
    return status;
  }

  private getPort(): number {
    const address = this.server?.address();
    if (typeof address === 'object' && address) {
      return address.port;
    }
    return this.port;
  }
}
