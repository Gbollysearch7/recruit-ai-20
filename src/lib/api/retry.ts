export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [429, 500, 502, 503, 504],
};

// Add jitter to prevent thundering herd
function addJitter(delay: number): number {
  const jitter = delay * 0.2 * Math.random();
  return Math.floor(delay + jitter);
}

// Calculate delay with exponential backoff
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(addJitter(exponentialDelay), maxDelay);
}

// Check if error is retryable
function isRetryableError(error: unknown, retryableStatuses: number[]): boolean {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch failed') || error.message.includes('network')) {
      return true;
    }

    // Check for HTTP status in error message
    const statusMatch = error.message.match(/(\d{3})/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      return retryableStatuses.includes(status);
    }
  }

  return false;
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt > config.maxRetries) {
        throw lastError;
      }

      // Check if error is retryable
      if (!isRetryableError(error, config.retryableStatuses)) {
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        config.baseDelay,
        config.maxDelay,
        config.backoffMultiplier
      );

      // Call retry callback (logging is handled by the callback)
      config.onRetry?.(attempt, lastError, delay);

      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Wrapper for fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, options);

    // Throw error for retryable status codes
    if (!response.ok) {
      const retryableStatuses = retryOptions.retryableStatuses || DEFAULT_OPTIONS.retryableStatuses;
      if (retryableStatuses.includes(response.status)) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    return response;
  }, retryOptions);
}
