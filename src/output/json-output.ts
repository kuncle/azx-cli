export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function outputJson(data: unknown): void {
  console.log(formatJson(data));
}
