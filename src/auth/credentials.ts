import { getProfile } from '../config/config-manager.js';
import type { ApiCredentials } from './types.js';
import { AuthError } from '../error/errors.js';
import { logger } from '../utils/logger.js';

export interface CredentialSources {
  apiKey?: string;
  secretKey?: string;
  profile?: string;
}

/**
 * Load credentials with priority: CLI flags > env vars > config file
 */
export function loadCredentials(sources: CredentialSources): ApiCredentials {
  const apiKey =
    sources.apiKey ||
    process.env['AZX_API_KEY'] ||
    getProfile(sources.profile).apiKey;

  const secretKey =
    sources.secretKey ||
    process.env['AZX_SECRET_KEY'] ||
    getProfile(sources.profile).secretKey;

  if (!apiKey || !secretKey) {
    throw new AuthError(
      'Missing API credentials. Provide via --api-key/--secret-key, AZX_API_KEY/AZX_SECRET_KEY env vars, or `azx config set`.',
    );
  }

  logger.debug('Credentials loaded successfully');
  return { apiKey, secretKey };
}

/**
 * Load builder code with priority: env var > config file > default 'AZX'
 */
export function loadBuilderCode(profile?: string): string {
  return process.env['BUILDER_CODE'] || getProfile(profile).builderCode || 'AZX';
}

/** Check if credentials are available (without throwing) */
export function hasCredentials(sources: CredentialSources): boolean {
  try {
    loadCredentials(sources);
    return true;
  } catch {
    return false;
  }
}
