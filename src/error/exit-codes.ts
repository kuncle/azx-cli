export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  AUTH_ERROR: 2,
  CONFIG_ERROR: 3,
  API_ERROR: 4,
  NETWORK_ERROR: 5,
  VALIDATION_ERROR: 6,
  NOT_FOUND: 7,
  RATE_LIMITED: 8,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
