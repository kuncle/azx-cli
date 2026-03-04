import { Command } from 'commander';
import { spotMarketCommands } from './market.js';
import { spotOrderCommands } from './order.js';
import { spotBatchOrderCommands } from './batch-order.js';
import { spotAccountCommands } from './account.js';
import { spotWsCommands } from './ws.js';

export function spotCommand(): Command {
  const cmd = new Command('spot').description('Spot trading commands');

  cmd.addCommand(spotMarketCommands());
  cmd.addCommand(spotOrderCommands());
  cmd.addCommand(spotBatchOrderCommands());
  cmd.addCommand(spotAccountCommands());
  cmd.addCommand(spotWsCommands());

  return cmd;
}
