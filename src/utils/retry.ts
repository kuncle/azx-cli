import { logger } from './logger.js';
import { NetworkError, ApiError, AuthError } from '../error/errors.js';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

function isRetryable(error: unknown): boolean {
  // Auth errors should never be retried
  if (error instanceof AuthError) return false;
  // Only retry network errors and 5xx server errors
  // API business errors (HTTP 200 with error codes) and 4xx client errors are not retryable
  if (error instanceof ApiError) {
    return error.statusCode >= 500;
  }
  // Network errors are retryable
  if (error instanceof NetworkError) return true;
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === opts.maxRetries || !isRetryable(error)) break;

      const delay = Math.min(opts.baseDelay * 2 ** attempt, opts.maxDelay);
      logger.debug(`Retry ${attempt + 1}/${opts.maxRetries} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new NetworkError(String(lastError));
}
