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

export function futuresEntrustCommands(): Command {
  const cmd = new Command('entrust').description('Futures trigger/conditional orders');

  // ─── Plan (Trigger Orders) ───────────────

  cmd
    .command('trigger')
    .description('Place a trigger/plan order')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('--side <side>', 'Order side (BUY/SELL)')
    .requiredOption('--stop-price <price>', 'Trigger price')
    .requiredOption('--quantity <qty>', 'Order quantity (contracts)')
    .requiredOption('--entrust-type <type>', 'Order type (TAKE_PROFIT/STOP/TAKE_PROFIT_MARKET/STOP_MARKET)')
    .requiredOption('--trigger-price-type <type>', 'Trigger source (INDEX_PRICE/MARK_PRICE/LATEST_PRICE)')
    .requiredOption('--position-side <side>', 'Position direction (LONG/SHORT)')
    .option('--price <price>', 'Execution price (required for limit types)')
    .option('--time-in-force <tif>', 'Time in force (GTC/IOC/FOK/GTX)', 'GTC')
    .option('--client-order-id <id>', 'Client order ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const params: Record<string, unknown> = {
        symbol: opts.symbol,
        orderSide: opts.side.toUpperCase(),
        stopPrice: opts.stopPrice,
        origQty: opts.quantity,
        entrustType: opts.entrustType.toUpperCase(),
        triggerPriceType: opts.triggerPriceType.toUpperCase(),
        positionSide: opts.positionSide.toUpperCase(),
        timeInForce: opts.timeInForce.toUpperCase(),
      };
      if (opts.price) params.price = opts.price;
      if (opts.clientOrderId) params.clientOrderId = opts.clientOrderId;
      const data = await client.createPlanEntrust(params);
      outputSuccess(data, g.format);
    });

  cmd
    .command('trigger-cancel')
    .description('Cancel a trigger/plan order')
    .requiredOption('--entrust-id <id>', 'Entrust ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.cancelPlanEntrust(opts.entrustId);
      outputSuccess(data, g.format);
    });

  cmd
    .command('trigger-list')
    .description('List trigger/plan orders')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Number of orders')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getPlanEntrusts({
        symbol: opts.symbol,
        limit: opts.limit ? parseIntSafe(opts.limit, '--limit') : undefined,
      });
      outputSuccess(data, g.format);
    });

  // ─── Profit (TP/SL) ─────────────────────

  cmd
    .command('tp-sl')
    .description('Place take-profit/stop-loss order')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('--side <side>', 'Order side (BUY/SELL)')
    .requiredOption('--trigger-price <price>', 'Trigger price')
    .option('--quantity <qty>', 'Order quantity')
    .option('--price <price>', 'Execution price')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const params: Record<string, unknown> = {
        symbol: opts.symbol,
        side: opts.side.toUpperCase(),
        triggerPrice: opts.triggerPrice,
      };
      if (opts.quantity) params.quantity = opts.quantity;
      if (opts.price) params.price = opts.price;
      const data = await client.createProfitEntrust(params);
      outputSuccess(data, g.format);
    });

  cmd
    .command('tp-sl-cancel')
    .description('Cancel a TP/SL order')
    .requiredOption('--profit-id <id>', 'Profit entrust ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.cancelProfitEntrust(opts.profitId);
      outputSuccess(data, g.format);
    });

  cmd
    .command('tp-sl-list')
    .description('List TP/SL orders')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Number of orders')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getProfitEntrusts({
        symbol: opts.symbol,
        limit: opts.limit ? parseIntSafe(opts.limit, '--limit') : undefined,
      });
      outputSuccess(data, g.format);
    });

  // ─── Track (Trailing Stop) ──────────────

  cmd
    .command('trailing')
    .description('Place trailing stop order')
    .requiredOption('-s, --symbol <symbol>', 'Trading pair')
    .requiredOption('--side <side>', 'Order side (BUY/SELL)')
    .requiredOption('--quantity <qty>', 'Order quantity (contracts)')
    .requiredOption('--callback-val <val>', 'Callback value (must > 0)')
    .requiredOption('--callback <type>', 'Callback type (FIXED/PROPORTION)')
    .requiredOption('--trigger-price-type <type>', 'Trigger source (INDEX_PRICE/MARK_PRICE/LATEST_PRICE)')
    .requiredOption('--position-side <side>', 'Position direction (LONG/SHORT)')
    .option('--position-type <type>', 'Margin mode (CROSSED/ISOLATED)', 'CROSSED')
    .option('--activation-price <price>', 'Activation price')
    .option('--client-order-id <id>', 'Client order ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const params: Record<string, unknown> = {
        symbol: opts.symbol,
        orderSide: opts.side.toUpperCase(),
        origQty: opts.quantity,
        callbackVal: opts.callbackVal,
        callback: opts.callback.toUpperCase(),
        triggerPriceType: opts.triggerPriceType.toUpperCase(),
        positionSide: opts.positionSide.toUpperCase(),
        positionType: opts.positionType.toUpperCase(),
      };
      if (opts.activationPrice) params.activationPrice = opts.activationPrice;
      if (opts.clientOrderId) params.clientOrderId = opts.clientOrderId;
      const data = await client.createTrackEntrust(params);
      outputSuccess(data, g.format);
    });

  cmd
    .command('trailing-cancel')
    .description('Cancel a trailing stop order')
    .requiredOption('--track-id <id>', 'Track entrust ID')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.cancelTrackEntrust(opts.trackId);
      outputSuccess(data, g.format);
    });

  cmd
    .command('trailing-list')
    .description('List trailing stop orders')
    .option('-s, --symbol <symbol>', 'Trading pair')
    .option('-l, --limit <n>', 'Number of orders')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const data = await client.getTrackEntrusts({
        symbol: opts.symbol,
        limit: opts.limit ? parseIntSafe(opts.limit, '--limit') : undefined,
      });
      outputSuccess(data, g.format);
    });

  return cmd;
}
