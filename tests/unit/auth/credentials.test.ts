import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadCredentials, hasCredentials, loadBuilderCode } from '../../../src/auth/credentials.js';
import { resetConfigCache } from '../../../src/config/config-manager.js';

describe('credentials', () => {
  const origApiKey = process.env['AZX_API_KEY'];
  const origSecretKey = process.env['AZX_SECRET_KEY'];
  const origBuilderCode = process.env['BUILDER_CODE'];

  beforeEach(() => {
    resetConfigCache();
    delete process.env['AZX_API_KEY'];
    delete process.env['AZX_SECRET_KEY'];
    delete process.env['BUILDER_CODE'];
  });

  afterEach(() => {
    if (origApiKey !== undefined) process.env['AZX_API_KEY'] = origApiKey;
    else delete process.env['AZX_API_KEY'];
    if (origSecretKey !== undefined) process.env['AZX_SECRET_KEY'] = origSecretKey;
    else delete process.env['AZX_SECRET_KEY'];
    if (origBuilderCode !== undefined) process.env['BUILDER_CODE'] = origBuilderCode;
    else delete process.env['BUILDER_CODE'];
  });

  describe('loadCredentials', () => {
    it('should load from CLI flags (highest priority)', () => {
      process.env['AZX_API_KEY'] = 'env-key';
      process.env['AZX_SECRET_KEY'] = 'env-secret';

      const creds = loadCredentials({
        apiKey: 'flag-key',
        secretKey: 'flag-secret',
      });
      expect(creds.apiKey).toBe('flag-key');
      expect(creds.secretKey).toBe('flag-secret');
    });

    it('should load from env vars', () => {
      process.env['AZX_API_KEY'] = 'env-key';
      process.env['AZX_SECRET_KEY'] = 'env-secret';

      const creds = loadCredentials({});
      expect(creds.apiKey).toBe('env-key');
      expect(creds.secretKey).toBe('env-secret');
    });

    it('should throw AuthError when no credentials available', () => {
      expect(() => loadCredentials({})).toThrow('Missing API credentials');
    });

    it('should throw when only apiKey provided', () => {
      process.env['AZX_API_KEY'] = 'key-only';
      expect(() => loadCredentials({})).toThrow('Missing API credentials');
    });
  });

  describe('hasCredentials', () => {
    it('should return true when credentials available', () => {
      process.env['AZX_API_KEY'] = 'key';
      process.env['AZX_SECRET_KEY'] = 'secret';
      expect(hasCredentials({})).toBe(true);
    });

    it('should return false when no credentials', () => {
      expect(hasCredentials({})).toBe(false);
    });
  });

  describe('loadBuilderCode', () => {
    it('should return default AZX when no env var or config', () => {
      expect(loadBuilderCode()).toBe('AZX');
    });

    it('should return env var BUILDER_CODE when set', () => {
      process.env['BUILDER_CODE'] = 'CUSTOM';
      expect(loadBuilderCode()).toBe('CUSTOM');
    });

    it('should prefer env var over config', () => {
      process.env['BUILDER_CODE'] = 'FROM_ENV';
      // Even with a profile, env var takes priority
      expect(loadBuilderCode('default')).toBe('FROM_ENV');
    });
  });
});
