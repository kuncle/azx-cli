import { createHmac } from 'node:crypto';
import type { ApiCredentials, SignedHeaders } from './types.js';
import { timestamp } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

export interface SignParams {
  method: string;
  path: string;
  query?: string;
  body?: string;
}

/**
 * Build the Y part of the preSign string for Spot.
 * Includes HTTP method: #METHOD#path[#query][#body]
 */
function buildSpotRequestPart(method: string, path: string, query?: string, body?: string): string {
  const m = method.toUpperCase();
  const hasQuery = query !== undefined && query !== '';
  const hasBody = body !== undefined && body !== '';

  if (hasQuery && hasBody) {
    return `#${m}#${path}#${query}#${body}`;
  } else if (hasQuery) {
    return `#${m}#${path}#${query}`;
  } else if (hasBody) {
    return `#${m}#${path}#${body}`;
  } else {
    return `#${m}#${path}`;
  }
}

/**
 * Build the Y part of the preSign string for Futures.
 * Does NOT include HTTP method: #path[#query][#body]
 */
function buildFuturesRequestPart(path: string, query?: string, body?: string): string {
  const hasQuery = query !== undefined && query !== '';
  const hasBody = body !== undefined && body !== '';

  if (hasQuery && hasBody) {
    return `#${path}#${query}#${body}`;
  } else if (hasQuery) {
    return `#${path}#${query}`;
  } else if (hasBody) {
    return `#${path}#${body}`;
  } else {
    return `#${path}`;
  }
}

/**
 * Spot signing algorithm:
 * 1. Sort validate-* headers alphabetically by key
 * 2. Join as key=value with &
 * 3. Append request part: #METHOD#path[#query][#body]
 * 4. HMAC-SHA256 with secretKey
 */
export function signSpot(credentials: ApiCredentials, params: SignParams): SignedHeaders {
  const ts = timestamp();
  const recvWindow = '5000';

  const headers: Record<string, string> = {
    'validate-appkey': credentials.apiKey,
    'validate-timestamp': ts,
    'validate-recvwindow': recvWindow,
    'validate-algorithms': 'HmacSHA256',
  };

  // Sort validate-* headers by key (natural ascending)
  const sortedKeys = Object.keys(headers).sort();
  const headerPart = sortedKeys.map((k) => `${k}=${headers[k]!}`).join('&');

  const requestPart = buildSpotRequestPart(params.method, params.path, params.query, params.body);
  const preSign = headerPart + requestPart;

  const signature = createHmac('sha256', credentials.secretKey)
    .update(preSign)
    .digest('hex');

  logger.debug('Spot sign: path=%s sig=%s...', params.path, signature.substring(0, 8));

  return {
    'validate-appkey': credentials.apiKey,
    'validate-timestamp': ts,
    'validate-signature': signature,
    'validate-recvwindow': recvWindow,
    'validate-algorithms': 'HmacSHA256',
  };
}

/**
 * Futures signing algorithm:
 * Header part X uses ONLY appkey + timestamp (not all 4 headers like Spot).
 * Data part Y uses the same conditional separator rules.
 * sign = X + Y
 *
 * X = "validate-appkey={key}&validate-timestamp={ts}"
 * Y = #path[#query][#body]  (NO method!)
 */
export function signFutures(credentials: ApiCredentials, params: SignParams): SignedHeaders {
  const ts = timestamp();

  // Futures pre-sign only includes appkey and timestamp
  const headerPart = `validate-appkey=${credentials.apiKey}&validate-timestamp=${ts}`;

  const requestPart = buildFuturesRequestPart(params.path, params.query, params.body);
  const preSign = headerPart + requestPart;

  const signature = createHmac('sha256', credentials.secretKey)
    .update(preSign)
    .digest('hex');

  logger.debug('Futures sign: path=%s sig=%s...', params.path, signature.substring(0, 8));

  return {
    'validate-appkey': credentials.apiKey,
    'validate-timestamp': ts,
    'validate-signature': signature,
  };
}
