import type { OutputFormat, ColumnDef } from './types.js';
import { outputJson } from './json-output.js';
import { outputTable } from './table-output.js';
import { outputCsv } from './csv-output.js';

export function output(data: unknown, format: OutputFormat, columns?: ColumnDef[]): void {
  switch (format) {
    case 'json':
      outputJson(data);
      break;
    case 'table':
      outputTable(data, columns);
      break;
    case 'csv':
      outputCsv(data, columns);
      break;
    case 'quiet':
      // Output nothing for quiet mode
      break;
  }
}

/** Output a success wrapper for agent consumption */
export function outputSuccess(data: unknown, format: OutputFormat, columns?: ColumnDef[]): void {
  if (format === 'json') {
    outputJson({ ok: true, data });
  } else {
    output(data, format, columns);
  }
}
