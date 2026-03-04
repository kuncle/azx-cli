import { Command } from 'commander';
import { SpotClient } from '../../client/spot-client.js';
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
  return new SpotClient({ credentials, sandbox: g.sandbox });
}

export function spotAccountCommands(): Command {
  const cmd = new Command('account').description('Spot account management');

  cmd
    .command('balances')
    .description('Get account balances')
    .option('--currency <currency>', 'Single currency balance')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getBalance(opts.currency);
      outputSuccess(data, g.format);
    });

  cmd
    .command('deposit-address')
    .description('Get deposit address for a coin')
    .requiredOption('--coin <coin>', 'Coin name (e.g., USDT)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getDepositAddress(opts.coin);
      outputSuccess(data, g.format);
    });

  cmd
    .command('deposit-history')
    .description('Get deposit history')
    .option('--coin <coin>', 'Filter by coin')
    .option('-l, --limit <n>', 'Number of records')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getDepositHistory({
        coin: opts.coin,
        limit: opts.limit ? parseIntSafe(opts.limit, '--limit') : undefined,
      });
      outputSuccess(data, g.format);
    });

  cmd
    .command('withdraw-history')
    .description('Get withdrawal history')
    .option('--coin <coin>', 'Filter by coin')
    .option('-l, --limit <n>', 'Number of records')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getWithdrawHistory({
        coin: opts.coin,
        limit: opts.limit ? parseIntSafe(opts.limit, '--limit') : undefined,
      });
      outputSuccess(data, g.format);
    });

  cmd
    .command('transfer')
    .description('Transfer between accounts')
    .requiredOption('--coin <coin>', 'Coin to transfer')
    .requiredOption('--amount <amount>', 'Amount to transfer')
    .requiredOption('--from <account>', 'Source account')
    .requiredOption('--to <account>', 'Destination account')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.transfer({
        coin: opts.coin,
        amount: opts.amount,
        from: opts.from,
        to: opts.to,
      });
      outputSuccess(data, g.format);
    });

  return cmd;
}
