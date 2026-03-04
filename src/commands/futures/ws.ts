import { Command } from 'commander';
import { FuturesWebSocket } from '../../websocket/futures-ws.js';

function getGlobalOpts(cmd: Command) {
  const root = cmd.parent?.parent?.parent;
  const opts = root?.opts() ?? {};
  return {
    sandbox: !!opts.sandbox,
  };
}

export function futuresWsCommands(): Command {
  const cmd = new Command('ws').description('Futures WebSocket streams');

  cmd
    .command('ticker')
    .description('Stream futures ticker updates')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new FuturesWebSocket({ sandbox: g.sandbox });
      ws.subscribe('ticker', { symbol: opts.symbol });
      await ws.connect();
      process.on('SIGINT', () => { ws.close(); process.exit(0); });
    });

  cmd
    .command('depth')
    .description('Stream futures order book')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new FuturesWebSocket({ sandbox: g.sandbox });
      ws.subscribe('depth', { symbol: opts.symbol });
      await ws.connect();
      process.on('SIGINT', () => { ws.close(); process.exit(0); });
    });

  cmd
    .command('klines')
    .description('Stream futures kline updates')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('-i, --interval <interval>', 'Kline interval')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new FuturesWebSocket({ sandbox: g.sandbox });
      ws.subscribe('kline', { symbol: opts.symbol, interval: opts.interval });
      await ws.connect();
      process.on('SIGINT', () => { ws.close(); process.exit(0); });
    });

  cmd
    .command('user-stream')
    .description('Stream futures user data')
    .option('--listen-key <key>', 'Listen key for user stream')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const ws = new FuturesWebSocket({ sandbox: g.sandbox });
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
