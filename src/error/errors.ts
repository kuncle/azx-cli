import { EXIT_CODES, type ExitCode } from './exit-codes.js';

export class AzxError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly exitCode: ExitCode = EXIT_CODES.GENERAL_ERROR,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AzxError';
  }

  toJSON() {
    return {
      ok: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

export class ApiError extends AzxError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly apiCode?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, apiCode ?? `HTTP_${statusCode}`, EXIT_CODES.API_ERROR, details);
    this.name = 'ApiError';
  }
}

export class AuthError extends AzxError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', EXIT_CODES.AUTH_ERROR, details);
    this.name = 'AuthError';
  }
}

export class ConfigError extends AzxError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', EXIT_CODES.CONFIG_ERROR, details);
    this.name = 'ConfigError';
  }
}

export class NetworkError extends AzxError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', EXIT_CODES.NETWORK_ERROR, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AzxError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', EXIT_CODES.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}
