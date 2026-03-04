import Table from 'cli-table3';
import type { ColumnDef } from './types.js';

export function formatTable(data: unknown, columns?: ColumnDef[]): string {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return '(no data)';

  const cols = columns ?? inferColumns(rows[0] as Record<string, unknown>);

  const table = new Table({
    head: cols.map((c) => c.header),
    colAligns: cols.map((c) => c.align ?? 'left'),
    style: { head: ['cyan'] },
  });

  for (const row of rows) {
    const r = row as Record<string, unknown>;
    table.push(cols.map((c) => {
      const val = r[c.key];
      return c.formatter ? c.formatter(val) : String(val ?? '');
    }));
  }

  return table.toString();
}

function inferColumns(sample: Record<string, unknown>): ColumnDef[] {
  return Object.keys(sample).map((key) => ({
    key,
    header: key,
  }));
}

export function outputTable(data: unknown, columns?: ColumnDef[]): void {
  console.log(formatTable(data, columns));
}
