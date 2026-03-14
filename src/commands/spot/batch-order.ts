import { Command } from 'commander';
import { SpotClient } from '../../client/spot-client.js';
import { loadCredentials, loadBuilderCode } from '../../auth/credentials.js';
import { outputSuccess } from '../../output/formatter.js';
import { ValidationError } from '../../error/errors.js';
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

export function spotBatchOrderCommands(): Command {
  const cmd = new Command('batch-order').description('Spot batch order operations');

  cmd
    .command('place')
    .description('Place multiple orders (JSON array via --orders)')
    .requiredOption('--orders <json>', 'JSON array of order objects')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      let orders: Record<string, unknown>[];
      try {
        orders = JSON.parse(opts.orders);
      } catch {
        throw new ValidationError('Invalid JSON for --orders');
      }
      if (!Array.isArray(orders)) {
        throw new ValidationError('--orders must be a JSON array');
      }
      if (orders.length === 0) {
        throw new ValidationError('--orders must not be empty');
      }
      const requiredFields = ['symbol', 'side', 'type'];
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        if (!order || typeof order !== 'object' || Array.isArray(order)) {
          throw new ValidationError(`--orders[${i}] must be an object`);
        }
        for (const field of requiredFields) {
          if (!(field in order)) {
            throw new ValidationError(`--orders[${i}] missing required field: ${field}`);
          }
        }
      }
      const data = await client.batchPlaceOrders(orders);
      outputSuccess(data, g.format);
    });

  cmd
    .command('cancel')
    .description('Cancel multiple orders')
    .requiredOption('--order-ids <ids>', 'Comma-separated order IDs')
    .action(async (opts) => {
      const g = getGlobalOpts(cmd);
      const client = makeClient(g);
      const orderIds = (opts.orderIds as string).split(',').map((id: string) => id.trim());
      const data = await client.batchCancelOrders(orderIds);
      outputSuccess(data, g.format);
    });

  return cmd;
}
