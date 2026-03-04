import { AzxError } from './errors.js';
import { EXIT_CODES } from './exit-codes.js';

export function handleError(error: unknown): never {
  if (error instanceof AzxError) {
    // Structured JSON error to stdout for agent consumption
    console.log(JSON.stringify(error.toJSON()));
    process.exit(error.exitCode);
  }

  // Unknown errors
  const message = error instanceof Error ? error.message : String(error);
  const output = {
    ok: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message,
    },
  };
  console.log(JSON.stringify(output));
  process.exit(EXIT_CODES.GENERAL_ERROR);
}
