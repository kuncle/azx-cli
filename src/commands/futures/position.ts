import { Command } from 'commander';
import { FuturesClient } from '../../client/futures-client.js';
import { loadCredentials } from '../../auth/credentials.js';
import { outputSuccess } from '../../output/formatter.js';
import { parseIntSafe } from '../../utils/helpers.js';
import type { OutputFormat } from '../../output/types.js';

function getGlobalOpts(cmd: Command) {
  const root = cmd.parent?.parent?.parent;
  const opts = root?.opts() ?? {};
  return {
    format: (opts.output ?? 'json') as OutputFormat,
    sandbox: !!opts.sandbox,
    profile: (opts.profile ?? 'default') as string,
    apiKey: opts.apiKey as string | undefined,
    secretKey: opts.secretKey as string | undefined,
  };
}

function makeClient(g: ReturnType<typeof getGlobalOpts>) {
  const credentials = loadCredentials({
    apiKey: g.apiKey,
    secretKey: g.secretKey,
    profile: g.profile,
  });
  return new FuturesClient({ credentials, sandbox: g.sandbox });
}

export function futuresPositionCommands(): Command {
  const cmd = new Command('position').description('Futures position management');

  cmd
    .command('list')
    .description('List active positions')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getPositions(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('detail')
    .description('Get position detail')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getPosition(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('leverage')
    .description('Set leverage')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('--leverage <n>', 'Leverage value')
    .option('--position-side <side>', 'Position side (LONG/SHORT)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.setLeverage({
        symbol: opts.symbol,
        leverage: parseIntSafe(opts.leverage, '--leverage'),
        positionSide: opts.positionSide,
      });
      outputSuccess(data, g.format);
    });

  cmd
    .command('adjust-margin')
    .description('Adjust position margin')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('--margin <amount>', 'Margin amount')
    .requiredOption('--position-side <side>', 'Position side (LONG/SHORT)')
    .requiredOption('--type <type>', 'Adjustment type (ADD/SUB)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.adjustMargin({
        symbol: opts.symbol,
        margin: opts.margin,
        positionSide: opts.positionSide,
        type: opts.type.toUpperCase(),
      });
      outputSuccess(data, g.format);
    });

  cmd
    .command('position-type')
    .description('Set position mode (CROSSED/ISOLATED)')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('--position-side <side>', 'Position side (LONG/SHORT)')
    .requiredOption('--position-type <type>', 'Position type (CROSSED/ISOLATED)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.setPositionType({
        symbol: opts.symbol,
        positionSide: opts.positionSide,
        positionType: opts.positionType.toUpperCase(),
      });
      outputSuccess(data, g.format);
    });

  cmd
    .command('close-all')
    .description('Close all positions')
    .action(async () => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.closeAllPositions();
      outputSuccess(data, g.format);
    });

  return cmd;
}
