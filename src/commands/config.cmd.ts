import { Command } from 'commander';
import {
  loadConfig,
  saveConfig,
  initConfig,
  setProfileValue,
  getConfigValue,
} from '../config/config-manager.js';
import { getConfigPath, getConfigDir } from '../config/paths.js';
import { outputSuccess } from '../output/formatter.js';
import type { OutputFormat } from '../output/types.js';

export function configCommand(): Command {
  const cmd = new Command('config').description('Manage CLI configuration');

  cmd
    .command('init')
    .description('Initialize configuration file')
    .option('--profile <name>', 'Profile name', 'default')
    .action((opts) => {
      const format = cmd.parent?.opts().output as OutputFormat ?? 'json';
      const config = initConfig(opts.profile);
      outputSuccess(
        { path: getConfigPath(), profile: opts.profile, config },
        format,
      );
    });

  cmd
    .command('set')
    .description('Set a configuration value')
    .argument('<key>', 'Config key (e.g., apiKey, secretKey, sandbox)')
    .argument('<value>', 'Config value')
    .option('--profile <name>', 'Profile name', 'default')
    .action((key, value, opts) => {
      const format = cmd.parent?.opts().output as OutputFormat ?? 'json';
      // Parse booleans
      const parsed = value === 'true' ? true : value === 'false' ? false : value;
      setProfileValue(opts.profile, key, parsed);
      outputSuccess({ profile: opts.profile, key, value: parsed }, format);
    });

  cmd
    .command('get')
    .description('Get a configuration value')
    .argument('<key>', 'Config key')
    .option('--profile <name>', 'Profile name', 'default')
    .action((key, opts) => {
      const format = cmd.parent?.opts().output as OutputFormat ?? 'json';
      const value = getConfigValue(opts.profile, key);
      outputSuccess({ profile: opts.profile, key, value: value ?? null }, format);
    });

  cmd
    .command('list')
    .description('List all configuration')
    .option('--profile <name>', 'Profile name')
    .option('--show-secrets', 'Show secret keys in full (default: masked)')
    .action((opts) => {
      const format = cmd.parent?.opts().output as OutputFormat ?? 'json';
      const config = loadConfig();
      const maskConfig = (obj: unknown): unknown => {
        if (!opts.showSecrets && obj && typeof obj === 'object') {
          const clone = JSON.parse(JSON.stringify(obj));
          const maskProfiles = (profiles: Record<string, Record<string, unknown>>) => {
            for (const p of Object.values(profiles)) {
              if (typeof p.secretKey === 'string' && p.secretKey.length > 4) {
                p.secretKey = '****' + p.secretKey.slice(-4);
              }
            }
          };
          if (clone.profiles) maskProfiles(clone.profiles);
          else if (clone.secretKey) {
            if (typeof clone.secretKey === 'string' && clone.secretKey.length > 4) {
              clone.secretKey = '****' + clone.secretKey.slice(-4);
            }
          }
          return clone;
        }
        return obj;
      };
      if (opts.profile) {
        const profile = config.profiles[opts.profile] ?? {};
        outputSuccess({ profile: opts.profile, config: maskConfig(profile) }, format);
      } else {
        outputSuccess(maskConfig(config), format);
      }
    });

  cmd
    .command('path')
    .description('Show configuration file path')
    .action(() => {
      const format = cmd.parent?.opts().output as OutputFormat ?? 'json';
      outputSuccess(
        { configPath: getConfigPath(), configDir: getConfigDir() },
        format,
      );
    });

  return cmd;
}
