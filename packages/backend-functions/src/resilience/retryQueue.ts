/**
 * Retry queue for failed operations
 */

export interface RetryOptions {
  maxRetries: number;
  retryDelay: number; // Base delay in ms
  backoffMultiplier: number; // Exponential backoff multiplier
  maxDelay: number; // Maximum delay between retries
}

export class RetryQueue<T> {
  private queue: Array<{
    fn: () => Promise<T>;
    retries: number;
    options: RetryOptions;
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
  }> = [];

  private processing = false;
  private defaultOptions: RetryOptions;

  constructor(defaultOptions: Partial<RetryOptions> = {}) {
    this.defaultOptions = {
      maxRetries: defaultOptions.maxRetries || 3,
      retryDelay: defaultOptions.retryDelay || 1000,
      backoffMultiplier: defaultOptions.backoffMultiplier || 2,
      maxDelay: defaultOptions.maxDelay || 30000
    };
  }

  /**
   * Add an operation to the retry queue
   */
  async enqueue(fn: () => Promise<T>, options: Partial<RetryOptions> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      const retryOptions = { ...this.defaultOptions, ...options };
      this.queue.push({
        fn,
        retries: 0,
        options: retryOptions,
        resolve,
        reject
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;

      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        if (item.retries < item.options.maxRetries) {
          item.retries++;
          const delay = Math.min(
            item.options.retryDelay * Math.pow(item.options.backoffMultiplier, item.retries - 1),
            item.options.maxDelay
          );

          // Re-queue after delay
          setTimeout(() => {
            this.queue.push(item);
            this.processQueue();
          }, delay);
        } else {
          item.reject(error);
        }
      }
    }

    this.processing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
