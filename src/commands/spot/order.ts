import { Command } from 'commander';
import { SpotClient } from '../../client/spot-client.js';
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
  return new SpotClient({ credentials, sandbox: g.sandbox, builderCode: loadBuilderCode(g.profile) });
}

export function spotOrderCommands(): Command {
  const cmd = new Command('order').description('Spot order management');

  cmd
    .command('place')
    .description('Place a new order')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('--side <side>', 'Order side (BUY/SELL)')
    .requiredOption('--type <type>', 'Order type (LIMIT/MARKET/LIMIT_MAKER)')
    .option('--price <price>', 'Order price (required for LIMIT)')
    .option('--quantity <qty>', 'Order quantity')
    .option('--quote-quantity <qty>', 'Quote order quantity (for MARKET BUY)')
    .option('--time-in-force <tif>', 'Time in force (GTC/IOC/FOK/GTX)', 'GTC')
    .option('--client-order-id <id>', 'Client order ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const params: Record<string, unknown> = {
        symbol: opts.symbol,
        side: opts.side.toUpperCase(),
        type: opts.type.toUpperCase(),
      };
      if (opts.price) params.price = opts.price;
      if (opts.quantity) params.quantity = opts.quantity;
      if (opts.quoteQuantity) params.quoteQuantity = opts.quoteQuantity;
      if (opts.timeInForce) params.timeInForce = opts.timeInForce;
      if (opts.clientOrderId) params.clientOrderId = opts.clientOrderId;
      const data = await client.placeOrder(params);
      outputSuccess(data, g.format);
    });

  cmd
    .command('cancel')
    .description('Cancel an order by ID')
    .requiredOption('--order-id <id>', 'Order ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.cancelOrder(opts.orderId);
      outputSuccess(data, g.format);
    });

  cmd
    .command('cancel-all')
    .description('Cancel all open orders')
    .option('-s, --symbol <symbol>', 'Trading pair (optional)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.cancelOpenOrders(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('query')
    .description('Query order details')
    .requiredOption('--order-id <id>', 'Order ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getOrderById(opts.orderId);
      outputSuccess(data, g.format);
    });

  cmd
    .command('open')
    .description('List open orders')
    .option('-s, --symbol <symbol>', 'Trading pair (optional)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getOpenOrders(opts.symbol);
      outputSuccess(data, g.format);
    });

  cmd
    .command('history')
    .description('Get order history')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Number of orders')
    .option('--start-time <ts>', 'Start time (ms)')
    .option('--end-time <ts>', 'End time (ms)')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getOrderHistory({
        symbol: opts.symbol,
        limit: opts.limit ? parseIntSafe(opts.limit, '--limit') : undefined,
        startTime: opts.startTime ? parseIntSafe(opts.startTime, '--start-time') : undefined,
        endTime: opts.endTime ? parseIntSafe(opts.endTime, '--end-time') : undefined,
      });
      outputSuccess(data, g.format);
    });

  return cmd;
}
