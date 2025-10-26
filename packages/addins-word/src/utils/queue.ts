export type AsyncJob = () => Promise<void>;

export class AsyncQueue {
  private queue: AsyncJob[] = [];
  private running = false;

  enqueue(job: AsyncJob) {
    this.queue.push(job);
    void this.runNext();
  }

  private async runNext() {
    if (this.running) {
      return;
    }
    const job = this.queue.shift();
    if (!job) {
      return;
    }
    this.running = true;
    try {
      await job();
    } finally {
      this.running = false;
      if (this.queue.length > 0) {
        void this.runNext();
      }
    }
  }
}
