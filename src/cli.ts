import { Command } from 'commander';
import { setVerbose } from './utils/logger.js';
import { configCommand } from './commands/config.cmd.js';
import { statusCommand } from './commands/status.cmd.js';
import { spotCommand } from './commands/spot/index.js';
import { futuresCommand } from './commands/futures/index.js';
import { handleError } from './error/error-handler.js';

export function createProgram(): Command {
  const program = new Command()
    .name('azx')
    .description('Agent-First CLI for AZX DEX (Spot + Futures)')
    .version('0.1.0')
    .option('--profile <name>', 'Configuration profile', 'default')
    .option('--output <format>', 'Output format: json | table | csv | quiet', 'json')
    .on('option:output', (val: string) => {
      const valid = ['json', 'table', 'csv', 'quiet'];
      if (!valid.includes(val)) {
        console.error(`error: option '--output' must be one of: ${valid.join(', ')} (received '${val}')`);
        process.exit(1);
      }
    })
    .option('--sandbox', 'Use sandbox environment')
    .option('--verbose', 'Enable debug logging to stderr')
    .option('--api-key <key>', 'Override API key')
    .option('--secret-key <key>', 'Override Secret key')
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts.verbose) {
        setVerbose(true);
      }
    });

  // Register commands
  program.addCommand(configCommand());
  program.addCommand(statusCommand());
  program.addCommand(spotCommand());
  program.addCommand(futuresCommand());

  // Global error handler
  program.exitOverride();

  return program;
}

export async function run(): Promise<void> {
  const program = createProgram();
  try {
    await program.parseAsync(process.argv);
  } catch (error: unknown) {
    // Commander exits with specific codes for --help/--version, which are fine
    if (error instanceof Object && 'code' in error) {
      const code = (error as { code: string }).code;
      if (
        code === 'commander.help' ||
        code === 'commander.helpDisplayed' ||
        code === 'commander.version'
      ) {
        return;
      }
      if (
        code === 'commander.missingArgument' ||
        code === 'commander.missingMandatoryOptionValue' ||
        code === 'commander.unknownCommand'
      ) {
        process.exit(1);
      }
    }
    handleError(error);
  }
}
