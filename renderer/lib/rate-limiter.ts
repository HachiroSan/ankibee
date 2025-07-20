// Rate limiter for API calls to prevent overwhelming external services
export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastCallTime = 0;
  private minInterval: number;

  constructor(minIntervalMs: number = 100) {
    this.minInterval = minIntervalMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;

      if (timeSinceLastCall < this.minInterval) {
        const delay = this.minInterval - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const task = this.queue.shift();
      if (task) {
        this.lastCallTime = Date.now();
        await task();
      }
    }

    this.processing = false;
  }

  // Clear the queue
  clear() {
    this.queue = [];
  }

  // Get current queue length
  getQueueLength(): number {
    return this.queue.length;
  }
}

// Create rate limiters for different API endpoints
export const dictionaryRateLimiter = new RateLimiter(200); // 5 requests per second
export const audioRateLimiter = new RateLimiter(300); // ~3 requests per second

// Utility function to create a rate-limited version of any async function
export function createRateLimitedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  rateLimiter: RateLimiter
): (...args: T) => Promise<R> {
  return (...args: T) => rateLimiter.execute(() => fn(...args));
} 