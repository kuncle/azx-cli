import { Command } from 'commander';
import { outputSuccess } from '../output/formatter.js';
import { hasCredentials } from '../auth/credentials.js';
import { loadConfig } from '../config/config-manager.js';
import { getConfigPath } from '../config/paths.js';
import { existsSync } from 'node:fs';
import type { OutputFormat } from '../output/types.js';

export function statusCommand(): Command {
  const cmd = new Command('status')
    .description('Check connection and configuration status')
    .action(async () => {
      const format = cmd.parent?.opts().output as OutputFormat ?? 'json';
      const profile = cmd.parent?.opts().profile as string ?? 'default';
      const sandbox = !!cmd.parent?.opts().sandbox;

      const configPath = getConfigPath();
      const configExists = existsSync(configPath);
      const config = loadConfig();
      const authenticated = hasCredentials({ profile });

      // Check connectivity
      const spotUrl = sandbox
        ? 'https://s-api.az-qa.xyz/api/spot/v1/market/ticker'
        : 'https://s-api.azverse.xyz/api/spot/v1/market/ticker';
      const futuresUrl = sandbox
        ? 'https://f-api.az-qa.xyz/api/futures/v1/market/ticker'
        : 'https://f-api.azverse.xyz/api/futures/v1/market/ticker';

      let spotOk = false;
      let futuresOk = false;

      try {
        const res = await fetch(spotUrl, { signal: AbortSignal.timeout(5000) });
        spotOk = res.ok;
      } catch { /* offline */ }

      try {
        const res = await fetch(futuresUrl, { signal: AbortSignal.timeout(5000) });
        futuresOk = res.ok;
      } catch { /* offline */ }

      outputSuccess(
        {
          profile,
          sandbox,
          configPath,
          configExists,
          authenticated,
          connectivity: {
            spot: spotOk ? 'ok' : 'unreachable',
            futures: futuresOk ? 'ok' : 'unreachable',
          },
          defaultProfile: config.defaultProfile,
          profiles: Object.keys(config.profiles),
        },
        format,
      );
    });

  return cmd;
}
