import { join } from 'node:path';
import { homedir } from 'node:os';

export function getConfigDir(): string {
  const xdgConfig = process.env['XDG_CONFIG_HOME'];
  const base = xdgConfig || join(homedir(), '.config');
  return join(base, 'azx-cli');
}

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}
