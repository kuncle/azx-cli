import { Command } from 'commander';
import { SpotWebSocket } from '../../websocket/spot-ws.js';
import { logger } from '../../utils/logger.js';

function getGlobalOpts(cmd: Command) {
  const root = cmd.parent?.parent?.parent;
  const opts = root?.opts() ?? {};
  return {
    sandbox: !!opts.sandbox,
  };
}

export function spotWsCommands(): Command {
  const cmd = new Command('ws').description('Spot WebSocket streams');

  cmd
    .command('ticker')
    .description('Stream ticker updates')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new SpotWebSocket({ sandbox: g.sandbox });
      ws.subscribe('ticker', { symbol: opts.symbol });
      await ws.connect();
      process.on('SIGINT', () => { ws.close(); process.exit(0); });
    });

  cmd
    .command('depth')
    .description('Stream order book updates')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new SpotWebSocket({ sandbox: g.sandbox });
      ws.subscribe('depth', { symbol: opts.symbol });
      await ws.connect();
      process.on('SIGINT', () => { ws.close(); process.exit(0); });
    });

  cmd
    .command('klines')
    .description('Stream kline updates')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('-i, --interval <interval>', 'Kline interval')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new SpotWebSocket({ sandbox: g.sandbox });
      ws.subscribe('kline', { symbol: opts.symbol, interval: opts.interval });
      await ws.connect();
      process.on('SIGINT', () => { ws.close(); process.exit(0); });
    });

  cmd
    .command('trades')
    .description('Stream recent trades')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new SpotWebSocket({ sandbox: g.sandbox });
      ws.subscribe('trade', { symbol: opts.symbol });
      await ws.connect();
      process.on('SIGINT', () => { ws.close(); process.exit(0); });
    });

  cmd
    .command('user-stream')
    .description('Stream user data (orders, balances)')
    .option('--listen-key <key>', 'Listen key for user stream')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new SpotWebSocket({ sandbox: g.sandbox });
      if (opts.listenKey) {
        ws.subscribe('user', { listenKey: opts.listenKey });
      } else {
        ws.subscribe('user', {});
      }
      await ws.connect();
      process.on('SIGINT', () => { ws.close(); process.exit(0); });
    });

  return cmd;
}
