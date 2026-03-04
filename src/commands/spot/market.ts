import { Command } from 'commander';
import { SpotClient } from '../../client/spot-client.js';
import { outputSuccess } from '../../output/formatter.js';
import { parseIntSafe } from '../../utils/helpers.js';
import type { OutputFormat } from '../../output/types.js';

function getGlobalOpts(cmd: Command) {
  const root = cmd.parent?.parent?.parent;
  const opts = root?.opts() ?? {};
  return {
    format: (opts.output ?? 'json') as OutputFormat,
    sandbox: !!opts.sandbox,
  };
}

export function spotMarketCommands(): Command {
  const cmd = new Command('market').description('Spot market data');

  cmd
    .command('ticker')
    .description('Get ticker price')
    .option('-s, --symbol <symbol>', 'Trading pair (e.g., btc_usdt)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getTicker(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('price')
    .description('Get latest price')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getTickerPrice(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('24h')
    .description('Get 24h ticker statistics')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getTicker24h(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('book')
    .description('Get best bid/ask')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getTickerBook(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('depth')
    .description('Get order book depth')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Depth limit', '20')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getDepth(opts.symbol, parseIntSafe(opts.limit, '--limit'));
      outputSuccess(data, g.format);
    });

  cmd
    .command('klines')
    .description('Get candlestick/kline data')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('-i, --interval <interval>', 'Kline interval (1m,5m,15m,1h,4h,1d...)')
    .option('-l, --limit <n>', 'Number of klines', '100')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getKlines(opts.symbol, opts.interval, parseIntSafe(opts.limit, '--limit'));
      outputSuccess(data, g.format);
    });

  cmd
    .command('trades')
    .description('Get recent trades')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Number of trades', '50')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getRecentTrades(opts.symbol, parseIntSafe(opts.limit, '--limit'));
      outputSuccess(data, g.format);
    });

  cmd
    .command('symbols')
    .description('List available trading pairs')
    .action(async () => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getSymbols();
      outputSuccess(data, g.format);
    });

  cmd
    .command('currencies')
    .description('List supported currencies')
    .action(async () => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getCurrencies();
      outputSuccess(data, g.format);
    });

  cmd
    .command('time')
    .description('Get server time')
    .action(async () => {
      const g = getGlobalOpts(cmd);
      const client = new SpotClient({ sandbox: g.sandbox });
      const data = await client.getServerTime();
      outputSuccess(data, g.format);
    });

  return cmd;
}
