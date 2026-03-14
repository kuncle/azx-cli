import { Command } from 'commander';
import { FuturesClient } from '../../client/futures-client.js';
import { loadCredentials, loadBuilderCode } from '../../auth/credentials.js';
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
  return new FuturesClient({ credentials, sandbox: g.sandbox, builderCode: loadBuilderCode(g.profile) });
}

export function futuresAccountCommands(): Command {
  const cmd = new Command('account').description('Futures account management');

  cmd
    .command('info')
    .description('Get account info')
    .action(async () => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getAccountInfo();
      outputSuccess(data, g.format);
    });

  cmd
    .command('balance')
    .description('Get futures account balance')
    .option('--coin <coin>', 'Single coin/currency')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getBalance(opts.coin);
      outputSuccess(data, g.format);
    });

  cmd
    .command('bills')
    .description('Get balance bill / transaction history')
    .option('-s, --symbol <symbol>', 'Filter by symbol')
    .option('-l, --limit <n>', 'Number of records')
    .option('--start-time <ts>', 'Start time (ms)')
    .option('--end-time <ts>', 'End time (ms)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getBalanceBill({
        symbol: opts.symbol,
        limit: opts.limit ? parseIntSafe(opts.limit, '--limit') : undefined,
        startTime: opts.startTime ? parseIntSafe(opts.startTime, '--start-time') : undefined,
        endTime: opts.endTime ? parseIntSafe(opts.endTime, '--end-time') : undefined,
      });
      outputSuccess(data, g.format);
    });

  cmd
    .command('funding')
    .description('Get funding fee history')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Number of records')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getFunding({
        symbol: opts.symbol,
        limit: opts.limit ? parseIntSafe(opts.limit, '--limit') : undefined,
      });
      outputSuccess(data, g.format);
    });

  return cmd;
}
