import { Command } from 'commander';
import { FuturesClient } from '../../client/futures-client.js';
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

export function futuresMarketCommands(): Command {
  const cmd = new Command('market').description('Futures market data');

  cmd
    .command('ticker')
    .description('Get futures ticker')
    .option('-s, --symbol <symbol>', 'Trading pair (omit for all)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = opts.symbol ? await client.getTicker(opts.symbol) : await client.getTickers();
      outputSuccess(data, g.format);
    });

  cmd
    .command('depth')
    .description('Get futures order book')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Depth limit', '20')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = await client.getDepth(opts.symbol, parseIntSafe(opts.limit, '--limit'));
      outputSuccess(data, g.format);
    });

  cmd
    .command('klines')
    .description('Get futures kline data')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('-i, --interval <interval>', 'Kline interval (1m,5m,15m,1h,4h,1d...)')
    .option('-l, --limit <n>', 'Number of klines', '100')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = await client.getKlines(opts.symbol, opts.interval, parseIntSafe(opts.limit, '--limit'));
      outputSuccess(data, g.format);
    });

  cmd
    .command('funding-rate')
    .description('Get funding rate')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = await client.getFundingRate(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('open-interest')
    .description('Get open interest')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = await client.getOpenInterest(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('mark-price')
    .description('Get mark price')
    .option('-s, --symbol <symbol>', 'Trading pair (omit for all)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = opts.symbol ? await client.getMarkPrice(opts.symbol) : await client.getMarkPrices();
      outputSuccess(data, g.format);
    });

  cmd
    .command('index-price')
    .description('Get index price')
    .option('-s, --symbol <symbol>', 'Trading pair (omit for all)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = opts.symbol ? await client.getIndexPrice(opts.symbol) : await client.getIndexPrices();
      outputSuccess(data, g.format);
    });

  cmd
    .command('symbols')
    .description('List available futures pairs')
    .action(async () => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = await client.getSymbols();
      outputSuccess(data, g.format);
    });

  cmd
    .command('deals')
    .description('Get recent deals/trades')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = new FuturesClient({ sandbox: g.sandbox });
      const data = await client.getDeal(opts.symbol);
      outputSuccess(data, g.format);
    });

  return cmd;
}
