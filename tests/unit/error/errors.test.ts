import { describe, it, expect } from 'vitest';
import { AzxError, ApiError, AuthError, ConfigError, NetworkError, ValidationError } from '../../../src/error/errors.js';
import { EXIT_CODES } from '../../../src/error/exit-codes.js';

describe('AzxError', () => {
  it('should create error with code and message', () => {
    const err = new AzxError('something broke', 'TEST_ERROR');
    expect(err.message).toBe('something broke');
    expect(err.code).toBe('TEST_ERROR');
    expect(err.exitCode).toBe(EXIT_CODES.GENERAL_ERROR);
  });

  it('should serialize to JSON with ok:false', () => {
    const err = new AzxError('fail', 'FAIL_CODE', EXIT_CODES.GENERAL_ERROR, { extra: 'info' });
    const json = err.toJSON();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe('FAIL_CODE');
    expect(json.error.message).toBe('fail');
    expect(json.error.details).toEqual({ extra: 'info' });
  });

  it('should omit details if not provided', () => {
    const err = new AzxError('fail', 'FAIL_CODE');
    const json = err.toJSON();
    expect(json.error.details).toBeUndefined();
  });
});

describe('ApiError', () => {
  it('should use API_ERROR exit code', () => {
    const err = new ApiError('Not found', 404, 'SYMBOL_NOT_FOUND');
    expect(err.exitCode).toBe(EXIT_CODES.API_ERROR);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('SYMBOL_NOT_FOUND');
  });

  it('should fallback to HTTP status code', () => {
    const err = new ApiError('Server error', 500);
    expect(err.code).toBe('HTTP_500');
  });
});

describe('AuthError', () => {
  it('should use AUTH_ERROR exit code', () => {
    const err = new AuthError('Missing credentials');
    expect(err.exitCode).toBe(EXIT_CODES.AUTH_ERROR);
    expect(err.code).toBe('AUTH_ERROR');
  });
});

describe('ConfigError', () => {
  it('should use CONFIG_ERROR exit code', () => {
    const err = new ConfigError('Invalid config');
    expect(err.exitCode).toBe(EXIT_CODES.CONFIG_ERROR);
    expect(err.code).toBe('CONFIG_ERROR');
  });
});

describe('NetworkError', () => {
  it('should use NETWORK_ERROR exit code', () => {
    const err = new NetworkError('Connection refused');
    expect(err.exitCode).toBe(EXIT_CODES.NETWORK_ERROR);
    expect(err.code).toBe('NETWORK_ERROR');
  });
});

describe('ValidationError', () => {
  it('should use VALIDATION_ERROR exit code', () => {
    const err = new ValidationError('Invalid JSON');
    expect(err.exitCode).toBe(EXIT_CODES.VALIDATION_ERROR);
    expect(err.code).toBe('VALIDATION_ERROR');
  });
});
