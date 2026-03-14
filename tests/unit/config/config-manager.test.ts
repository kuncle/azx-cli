import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Override XDG before importing config modules
const TEST_DIR = join(tmpdir(), `azx-test-${Date.now()}`);
process.env['XDG_CONFIG_HOME'] = TEST_DIR;

// Dynamic import after env setup
const { loadConfig, saveConfig, initConfig, setProfileValue, getConfigValue, getProfile, resetConfigCache } = await import('../../../src/config/config-manager.js');
const { getConfigPath } = await import('../../../src/config/paths.js');

describe('config-manager', () => {
  beforeEach(() => {
    resetConfigCache();
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    resetConfigCache();
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('loadConfig', () => {
    it('should return default config when no config file exists', () => {
      const config = loadConfig();
      expect(config.defaultProfile).toBe('default');
      expect(config.profiles).toEqual({});
    });

    it('should load existing config file', () => {
      const configPath = getConfigPath();
      mkdirSync(join(TEST_DIR, 'azx-cli'), { recursive: true });
      writeFileSync(configPath, JSON.stringify({
        defaultProfile: 'prod',
        profiles: { prod: { apiKey: 'key123' } },
      }));

      const config = loadConfig();
      expect(config.defaultProfile).toBe('prod');
      expect(config.profiles.prod?.apiKey).toBe('key123');
    });
  });

  describe('saveConfig', () => {
    it('should create config directory and file', () => {
      const config = { defaultProfile: 'default', profiles: { default: { sandbox: true } } };
      saveConfig(config);

      const configPath = getConfigPath();
      expect(existsSync(configPath)).toBe(true);
    });
  });

  describe('initConfig', () => {
    it('should create profile if not exists', () => {
      const config = initConfig('myprofile');
      expect(config.profiles['myprofile']).toEqual({});
    });
  });

  describe('setProfileValue / getConfigValue', () => {
    it('should set and get a string value', () => {
      initConfig('default');
      setProfileValue('default', 'apiKey', 'abc123');
      const value = getConfigValue('default', 'apiKey');
      expect(value).toBe('abc123');
    });

    it('should set and get a boolean value', () => {
      initConfig('default');
      setProfileValue('default', 'sandbox', true);
      const value = getConfigValue('default', 'sandbox');
      expect(value).toBe(true);
    });
  });

  describe('getProfile', () => {
    it('should return empty object for non-existent profile', () => {
      const profile = getProfile('nonexistent');
      expect(profile).toEqual({});
    });

    it('should return profile data', () => {
      initConfig('test');
      setProfileValue('test', 'apiKey', 'testkey');
      const profile = getProfile('test');
      expect(profile.apiKey).toBe('testkey');
    });
  });

  describe('builderCode config', () => {
    it('should store and retrieve builderCode in profile', () => {
      initConfig('default');
      setProfileValue('default', 'builderCode', 'MYCODE');
      const profile = getProfile('default');
      expect(profile.builderCode).toBe('MYCODE');
    });

    it('should return undefined builderCode when not set', () => {
      initConfig('default');
      const profile = getProfile('default');
      expect(profile.builderCode).toBeUndefined();
    });

    it('should load config with builderCode from file', () => {
      const configPath = getConfigPath();
      mkdirSync(join(TEST_DIR, 'azx-cli'), { recursive: true });
      writeFileSync(configPath, JSON.stringify({
        defaultProfile: 'default',
        profiles: { default: { builderCode: 'FILE_CODE' } },
      }));

      const config = loadConfig();
      expect(config.profiles.default?.builderCode).toBe('FILE_CODE');
    });
  });
});
