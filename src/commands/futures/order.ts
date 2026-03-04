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

export function futuresOrderCommands(): Command {
  const cmd = new Command('order').description('Futures order management');

  cmd
    .command('place')
    .description('Place a futures order')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('--side <side>', 'Order side (BUY/SELL)')
    .requiredOption('--type <type>', 'Order type (LIMIT/MARKET)')
    .requiredOption('--quantity <qty>', 'Order quantity (contracts)')
    .requiredOption('--position-side <side>', 'Position side (LONG/SHORT)')
    .option('--price <price>', 'Order price (required for LIMIT)')
    .option('--time-in-force <tif>', 'Time in force (GTC/IOC/FOK/GTX)', 'GTC')
    .option('--client-order-id <id>', 'Client order ID')
    .option('--trigger-profit-price <price>', 'Take profit trigger price')
    .option('--trigger-stop-price <price>', 'Stop loss trigger price')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const params: Record<string, unknown> = {
        symbol: opts.symbol,
        orderSide: opts.side.toUpperCase(),
        orderType: opts.type.toUpperCase(),
        origQty: opts.quantity,
        positionSide: opts.positionSide.toUpperCase(),
      };
      if (opts.price) params.price = opts.price;
      if (opts.timeInForce) params.timeInForce = opts.timeInForce;
      if (opts.clientOrderId) params.clientOrderId = opts.clientOrderId;
      if (opts.triggerProfitPrice) params.triggerProfitPrice = opts.triggerProfitPrice;
      if (opts.triggerStopPrice) params.triggerStopPrice = opts.triggerStopPrice;
      const data = await client.placeOrder(params);
      outputSuccess(data, g.format);
    });

  cmd
    .command('cancel')
    .description('Cancel a futures order')
    .requiredOption('--order-id <id>', 'Order ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.cancelOrder(opts.orderId);
      outputSuccess(data, g.format);
    });

  cmd
    .command('cancel-batch')
    .description('Cancel all orders for a symbol')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair (empty string for all)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.cancelBatchOrders(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('query')
    .description('Query futures order details')
    .requiredOption('--order-id <id>', 'Order ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getOrderById(opts.orderId);
      outputSuccess(data, g.format);
    });

  cmd
    .command('open')
    .description('List open futures orders')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .option('--page <n>', 'Page number', '1')
    .option('--size <n>', 'Page size', '10')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getOpenOrders({
        symbol: opts.symbol,
        page: parseIntSafe(opts.page, '--page'),
        size: parseIntSafe(opts.size, '--size'),
      });
      outputSuccess(data, g.format);
    });

  cmd
    .command('history')
    .description('Get futures order history')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Number of orders', '10')
    .option('--start-time <ts>', 'Start time (ms)')
    .option('--end-time <ts>', 'End time (ms)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getOrderHistory({
        symbol: opts.symbol,
        limit: parseIntSafe(opts.limit, '--limit'),
        startTime: opts.startTime ? parseIntSafe(opts.startTime, '--start-time') : undefined,
        endTime: opts.endTime ? parseIntSafe(opts.endTime, '--end-time') : undefined,
      });
      outputSuccess(data, g.format);
    });

  cmd
    .command('trades')
    .description('Get order trade fills')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .option('--order-id <id>', 'Order ID')
    .option('--size <n>', 'Number of trades', '10')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getOrderTrades({
        symbol: opts.symbol,
        orderId: opts.orderId,
        size: parseIntSafe(opts.size, '--size'),
      });
      outputSuccess(data, g.format);
    });

  return cmd;
}
