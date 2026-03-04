export type OutputFormat = 'json' | 'table' | 'csv' | 'quiet';

export interface ColumnDef {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: unknown) => string;
}

export interface OutputOptions {
  format: OutputFormat;
  columns?: ColumnDef[];
}
