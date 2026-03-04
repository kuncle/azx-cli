import { Command } from 'commander';
import { futuresMarketCommands } from './market.js';
import { futuresOrderCommands } from './order.js';
import { futuresEntrustCommands } from './entrust.js';
import { futuresPositionCommands } from './position.js';
import { futuresAccountCommands } from './account.js';
import { futuresWsCommands } from './ws.js';

export function futuresCommand(): Command {
  const cmd = new Command('futures').description('Futures trading commands');

  cmd.addCommand(futuresMarketCommands());
  cmd.addCommand(futuresOrderCommands());
  cmd.addCommand(futuresEntrustCommands());
  cmd.addCommand(futuresPositionCommands());
  cmd.addCommand(futuresAccountCommands());
  cmd.addCommand(futuresWsCommands());

  return cmd;
}
