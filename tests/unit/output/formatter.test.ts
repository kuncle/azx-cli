import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { output, outputSuccess } from '../../../src/output/formatter.js';
import { formatJson } from '../../../src/output/json-output.js';
import { formatCsv } from '../../../src/output/csv-output.js';
import { formatTable } from '../../../src/output/table-output.js';

describe('formatJson', () => {
  it('should format data as pretty JSON', () => {
    const result = formatJson({ symbol: 'btc_usdt', price: '50000' });
    expect(JSON.parse(result)).toEqual({ symbol: 'btc_usdt', price: '50000' });
  });

  it('should handle arrays', () => {
    const result = formatJson([1, 2, 3]);
    expect(JSON.parse(result)).toEqual([1, 2, 3]);
  });

  it('should handle null and primitives', () => {
    expect(formatJson(null)).toBe('null');
    expect(formatJson(42)).toBe('42');
    expect(formatJson('hello')).toBe('"hello"');
  });
});

describe('formatCsv', () => {
  it('should format single object as CSV', () => {
    const result = formatCsv({ symbol: 'btc_usdt', price: '50000' });
    const lines = result.split('\n');
    expect(lines[0]).toBe('symbol,price');
    expect(lines[1]).toBe('btc_usdt,50000');
  });

  it('should format array of objects', () => {
    const data = [
      { symbol: 'btc_usdt', price: '50000' },
      { symbol: 'eth_usdt', price: '3000' },
    ];
    const result = formatCsv(data);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[0]).toBe('symbol,price');
    expect(lines[1]).toBe('btc_usdt,50000');
    expect(lines[2]).toBe('eth_usdt,3000');
  });

  it('should escape commas in values', () => {
    const result = formatCsv({ msg: 'hello, world' });
    expect(result).toContain('"hello, world"');
  });

  it('should escape quotes in values', () => {
    const result = formatCsv({ msg: 'say "hi"' });
    expect(result).toContain('"say ""hi"""');
  });

  it('should return empty string for empty array', () => {
    const result = formatCsv([]);
    expect(result).toBe('');
  });

  it('should use custom columns', () => {
    const data = { a: '1', b: '2', c: '3' };
    const result = formatCsv(data, [
      { key: 'a', header: 'ColA' },
      { key: 'c', header: 'ColC' },
    ]);
    const lines = result.split('\n');
    expect(lines[0]).toBe('ColA,ColC');
    expect(lines[1]).toBe('1,3');
  });
});

describe('formatTable', () => {
  it('should format single object as table', () => {
    const result = formatTable({ symbol: 'btc_usdt', price: '50000' });
    expect(result).toContain('symbol');
    expect(result).toContain('price');
    expect(result).toContain('btc_usdt');
    expect(result).toContain('50000');
  });

  it('should handle empty array', () => {
    const result = formatTable([]);
    expect(result).toBe('(no data)');
  });
});

describe('output', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should output JSON format', () => {
    output({ key: 'value' }, 'json');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"key"'));
  });

  it('should output table format', () => {
    output({ key: 'value' }, 'table');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('key'));
  });

  it('should output CSV format', () => {
    output({ key: 'value' }, 'csv');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('key'));
  });

  it('should output nothing for quiet format', () => {
    output({ key: 'value' }, 'quiet');
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

describe('outputSuccess', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should wrap data with ok:true in JSON mode', () => {
    outputSuccess({ price: '50000' }, 'json');
    const output = consoleSpy.mock.calls[0]![0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.ok).toBe(true);
    expect(parsed.data.price).toBe('50000');
  });

  it('should output raw data in table mode (no wrapper)', () => {
    outputSuccess({ price: '50000' }, 'table');
    const output = consoleSpy.mock.calls[0]![0] as string;
    // Table mode outputs the raw table, not JSON wrapper
    expect(output).toContain('price');
    expect(output).toContain('50000');
  });
});
