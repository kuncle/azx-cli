import type { ColumnDef } from './types.js';

const CSV_INJECTION_CHARS = ['=', '+', '-', '@', '\t', '\r'];

function escapeCsvField(value: string): string {
  let escaped = value;
  if (escaped.length > 0 && CSV_INJECTION_CHARS.includes(escaped[0]!)) {
    escaped = `'${escaped}`;
  }
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped.replace(/"/g, '""')}"`;
  }
  return escaped;
}

export function formatCsv(data: unknown, columns?: ColumnDef[]): string {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return '';

  const cols: ColumnDef[] = columns ?? Object.keys(rows[0] as Record<string, unknown>).map((key) => ({
    key,
    header: key,
  }));

  const lines: string[] = [];
  lines.push(cols.map((c) => escapeCsvField(c.header)).join(','));

  for (const row of rows) {
    const r = row as Record<string, unknown>;
    lines.push(cols.map((c) => {
      const val = r[c.key];
      const str = c.formatter ? c.formatter(val) : String(val ?? '');
      return escapeCsvField(str);
    }).join(','));
  }

  return lines.join('\n');
}

export function outputCsv(data: unknown, columns?: ColumnDef[]): void {
  console.log(formatCsv(data, columns));
}
