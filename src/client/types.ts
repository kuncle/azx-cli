export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
  signed?: boolean;
}

/** AZX API response wrapper: {rc, mc, ma, result} */
export interface ApiResponse<T = unknown> {
  rc: number;
  mc: string;
  ma: string[];
  result: T;
}
