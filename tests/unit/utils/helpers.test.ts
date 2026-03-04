import { describe, it, expect } from 'vitest';
import { sortKeys, timestamp, safeJsonParse } from '../../../src/utils/helpers.js';

describe('sortKeys', () => {
  it('should sort object keys alphabetically', () => {
    const result = sortKeys({ c: '3', a: '1', b: '2' });
    expect(Object.keys(result)).toEqual(['a', 'b', 'c']);
    expect(result).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('should handle empty object', () => {
    expect(sortKeys({})).toEqual({});
  });

  it('should handle already sorted keys', () => {
    const result = sortKeys({ a: '1', b: '2' });
    expect(Object.keys(result)).toEqual(['a', 'b']);
  });
});

describe('timestamp', () => {
  it('should return string of current time in milliseconds', () => {
    const ts = timestamp();
    expect(ts).toMatch(/^\d{13}$/);
    const diff = Math.abs(Date.now() - parseInt(ts));
    expect(diff).toBeLessThan(1000);
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    expect(safeJsonParse('[1,2,3]')).toEqual([1, 2, 3]);
    expect(safeJsonParse('"hello"')).toBe('hello');
    expect(safeJsonParse('42')).toBe(42);
  });

  it('should return undefined for invalid JSON', () => {
    expect(safeJsonParse('not json')).toBeUndefined();
    expect(safeJsonParse('{broken')).toBeUndefined();
    expect(safeJsonParse('')).toBeUndefined();
  });
});
