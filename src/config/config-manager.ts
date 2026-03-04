import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { configSchema } from './config-schema.js';
import { getConfigPath } from './paths.js';
import type { AzxConfig, ProfileConfig } from './types.js';
import { ConfigError, ValidationError } from '../error/errors.js';
import { logger } from '../utils/logger.js';

let cachedConfig: AzxConfig | null = null;

export function loadConfig(): AzxConfig {
  if (cachedConfig) return cachedConfig;

  const configPath = getConfigPath();
  logger.debug(`Loading config from ${configPath}`);

  if (!existsSync(configPath)) {
    cachedConfig = { defaultProfile: 'default', profiles: {} };
    return cachedConfig;
  }

  try {
    const raw = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const validated = configSchema.parse(parsed);
    cachedConfig = validated as AzxConfig;
    return cachedConfig;
  } catch (error) {
    throw new ConfigError(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function saveConfig(config: AzxConfig): void {
  const configPath = getConfigPath();
  const dir = dirname(configPath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2), { encoding: 'utf-8', mode: 0o600 });
  cachedConfig = config;
  logger.debug(`Config saved to ${configPath}`);
}

export function getProfile(profileName?: string): ProfileConfig {
  const config = loadConfig();
  const name = profileName ?? config.defaultProfile;
  return config.profiles[name] ?? {};
}

const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

export function setProfileValue(profileName: string, key: string, value: string | boolean): void {
  if (DANGEROUS_KEYS.includes(key)) {
    throw new ValidationError(`Invalid config key: ${key}`);
  }
  const config = loadConfig();
  if (!config.profiles[profileName]) {
    config.profiles[profileName] = {};
  }
  (config.profiles[profileName] as Record<string, unknown>)[key] = value;
  saveConfig(config);
}

export function getConfigValue(profileName: string, key: string): unknown {
  const profile = getProfile(profileName);
  return (profile as Record<string, unknown>)[key];
}

export function initConfig(profile: string): AzxConfig {
  const config = loadConfig();
  if (!config.profiles[profile]) {
    config.profiles[profile] = {};
  }
  saveConfig(config);
  return config;
}

export function resetConfigCache(): void {
  cachedConfig = null;
}
