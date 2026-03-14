import type { ApiCredentials } from '../auth/types.js';
import type { SignedHeaders } from '../auth/types.js';
import type { RequestConfig, ApiResponse } from './types.js';
import { ApiError, NetworkError } from '../error/errors.js';
import { withRetry, type RetryOptions } from '../utils/retry.js';
import { logger } from '../utils/logger.js';

export abstract class BaseClient {
  protected baseUrl: string;
  protected credentials?: ApiCredentials;
  protected retryOptions: Partial<RetryOptions>;
  protected builderCode: string;

  constructor(baseUrl: string, credentials?: ApiCredentials, retryOptions?: Partial<RetryOptions>, builderCode?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.credentials = credentials;
    this.retryOptions = retryOptions ?? {};
    this.builderCode = builderCode ?? 'AZX';
  }

  protected abstract sign(params: {
    method: string;
    path: string;
    query?: string;
    body?: string;
  }): SignedHeaders;

  async request<T = unknown>(config: RequestConfig): Promise<T> {
    const { method, path, query, body, signed = false, extraHeaders } = config;

    // Build query string
    const filteredQuery: Record<string, string> = {};
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) {
          filteredQuery[k] = String(v);
        }
      }
    }
    const params = new URLSearchParams(filteredQuery);
    params.sort(); // Sort by key for consistent signing
    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}${path}?${queryString}`
      : `${this.baseUrl}${path}`;

    const bodyStr = body ? JSON.stringify(body) : undefined;

    if (signed && !this.credentials) {
      throw new ApiError('Credentials required for signed requests', 401);
    }

    logger.debug(`${method} ${url}`);

    return withRetry(async () => {
      // Build headers fresh each attempt so signed timestamps are not stale on retry
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (signed) {
        const signedHeaders = this.sign({
          method,
          path,
          query: queryString,
          body: bodyStr || '',
        });
        Object.assign(headers, signedHeaders);
      }

      if (extraHeaders) {
        Object.assign(headers, extraHeaders);
      }

      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: method === 'GET' || method === 'DELETE' ? undefined : bodyStr,
          signal: AbortSignal.timeout(30_000),
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'TimeoutError') {
          throw new NetworkError('Request timeout');
        }
        throw new NetworkError(
          `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      const text = await response.text();
      logger.debug(`Response ${response.status}: ${text.substring(0, 200)}`);

      if (!response.ok) {
        let apiCode: string | undefined;
        let message = `HTTP ${response.status}`;
        try {
          const parsed = JSON.parse(text);
          apiCode = String(parsed.rc ?? parsed.code ?? '');
          message = parsed.mc || parsed.msg || parsed.message || message;
        } catch { /* not JSON */ }
        throw new ApiError(message, response.status, apiCode);
      }

      try {
        const parsed = JSON.parse(text);

        // Format 1: Spot API — {rc, mc, ma, result}
        if (parsed.rc !== undefined) {
          if (parsed.rc !== 0) {
            throw new ApiError(
              parsed.mc || 'API error',
              response.status,
              String(parsed.rc),
              parsed.ma?.length ? { messages: parsed.ma } : undefined,
            );
          }
          return parsed.result !== undefined ? (parsed.result as T) : (parsed as unknown as T);
        }

        // Format 2: Futures API — {returnCode, msgInfo, error, result}
        if (parsed.returnCode !== undefined) {
          if (parsed.returnCode !== 0) {
            throw new ApiError(
              parsed.msgInfo || parsed.error || 'API error',
              response.status,
              String(parsed.returnCode),
            );
          }
          return parsed.result !== undefined ? (parsed.result as T) : (parsed as unknown as T);
        }

        // Fallback: return as-is
        return parsed as T;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Invalid response from server (HTTP ${response.status})`, response.status);
      }
    }, this.retryOptions);
  }
}
