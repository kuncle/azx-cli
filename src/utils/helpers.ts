import { ValidationError } from '../error/errors.js';

/** Parse integer with NaN validation */
export function parseIntSafe(value: string, name: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n)) {
    throw new ValidationError(`${name} must be a valid integer (received '${value}')`);
  }
  return n;
}

/** Sort object keys alphabetically */
export function sortKeys(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key]!;
  }
  return sorted;
}

/** Get current timestamp in milliseconds */
export function timestamp(): string {
  return Date.now().toString();
}

/** Sleep for given milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Safely parse JSON, return undefined on failure */
export function safeJsonParse<T = unknown>(str: string): T | undefined {
  try {
    return JSON.parse(str) as T;
  } catch {
    return undefined;
  }
}
