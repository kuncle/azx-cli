import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const CLI = resolve(import.meta.dirname, '../../bin/azx.js');

function run(args: string[]): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execFileSync('node', [CLI, ...args], {
      encoding: 'utf-8',
      timeout: 5000,
      env: { ...process.env, AZX_API_KEY: undefined, AZX_SECRET_KEY: undefined },
    });
    return { stdout, stderr: '', code: 0 };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      code: err.status ?? 1,
    };
  }
}

describe('Root CLI', () => {
  it('azx --help shows all command groups', () => {
    const { stdout } = run(['--help']);
    expect(stdout).toContain('config');
    expect(stdout).toContain('status');
    expect(stdout).toContain('spot');
    expect(stdout).toContain('futures');
    expect(stdout).toContain('--profile');
    expect(stdout).toContain('--output');
    expect(stdout).toContain('--sandbox');
    expect(stdout).toContain('--verbose');
    expect(stdout).toContain('--api-key');
    expect(stdout).toContain('--secret-key');
  });

  it('azx --version shows version', () => {
    const { stdout } = run(['--version']);
    expect(stdout.trim()).toBe('0.1.0');
  });
});

describe('Config commands', () => {
  it('config --help lists subcommands', () => {
    const { stdout } = run(['config', '--help']);
    expect(stdout).toContain('init');
    expect(stdout).toContain('set');
    expect(stdout).toContain('get');
    expect(stdout).toContain('list');
    expect(stdout).toContain('path');
  });

  it('config path returns JSON with paths', () => {
    const { stdout } = run(['config', 'path']);
    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(true);
    expect(parsed.data.configPath).toContain('azx-cli');
    expect(parsed.data.configDir).toContain('azx-cli');
  });

  it('config list returns valid JSON', () => {
    const { stdout } = run(['config', 'list']);
    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(true);
    expect(parsed.data).toHaveProperty('defaultProfile');
    expect(parsed.data).toHaveProperty('profiles');
  });
});

describe('Spot commands', () => {
  it('spot --help lists all spot subcommands', () => {
    const { stdout } = run(['spot', '--help']);
    expect(stdout).toContain('market');
    expect(stdout).toContain('order');
    expect(stdout).toContain('batch-order');
    expect(stdout).toContain('account');
    expect(stdout).toContain('ws');
  });

  it('spot market --help lists market subcommands', () => {
    const { stdout } = run(['spot', 'market', '--help']);
    expect(stdout).toContain('ticker');
    expect(stdout).toContain('depth');
    expect(stdout).toContain('klines');
    expect(stdout).toContain('trades');
  });

  it('spot order --help lists order subcommands', () => {
    const { stdout } = run(['spot', 'order', '--help']);
    expect(stdout).toContain('place');
    expect(stdout).toContain('cancel');
    expect(stdout).toContain('cancel-all');
    expect(stdout).toContain('query');
    expect(stdout).toContain('open');
    expect(stdout).toContain('history');
  });

  it('spot batch-order --help lists batch subcommands', () => {
    const { stdout } = run(['spot', 'batch-order', '--help']);
    expect(stdout).toContain('place');
    expect(stdout).toContain('cancel');
  });

  it('spot account --help lists account subcommands', () => {
    const { stdout } = run(['spot', 'account', '--help']);
    expect(stdout).toContain('balances');
    expect(stdout).toContain('deposit-address');
    expect(stdout).toContain('withdraw-history');
    expect(stdout).toContain('transfer');
  });

  it('spot ws --help lists ws subcommands', () => {
    const { stdout } = run(['spot', 'ws', '--help']);
    expect(stdout).toContain('ticker');
    expect(stdout).toContain('depth');
    expect(stdout).toContain('klines');
    expect(stdout).toContain('trades');
    expect(stdout).toContain('user-stream');
  });

  it('spot order place --help shows all options', () => {
    const { stdout } = run(['spot', 'order', 'place', '--help']);
    expect(stdout).toContain('--symbol');
    expect(stdout).toContain('--side');
    expect(stdout).toContain('--type');
    expect(stdout).toContain('--price');
    expect(stdout).toContain('--quantity');
    expect(stdout).toContain('--time-in-force');
  });
});

describe('Futures commands', () => {
  it('futures --help lists all futures subcommands', () => {
    const { stdout } = run(['futures', '--help']);
    expect(stdout).toContain('market');
    expect(stdout).toContain('order');
    expect(stdout).toContain('entrust');
    expect(stdout).toContain('position');
    expect(stdout).toContain('account');
    expect(stdout).toContain('ws');
  });

  it('futures market --help lists market subcommands', () => {
    const { stdout } = run(['futures', 'market', '--help']);
    expect(stdout).toContain('ticker');
    expect(stdout).toContain('depth');
    expect(stdout).toContain('klines');
    expect(stdout).toContain('funding-rate');
    expect(stdout).toContain('open-interest');
  });

  it('futures order --help lists order subcommands', () => {
    const { stdout } = run(['futures', 'order', '--help']);
    expect(stdout).toContain('place');
    expect(stdout).toContain('cancel');
    expect(stdout).toContain('cancel-batch');
    expect(stdout).toContain('query');
    expect(stdout).toContain('open');
    expect(stdout).toContain('history');
  });

  it('futures entrust --help lists entrust subcommands', () => {
    const { stdout } = run(['futures', 'entrust', '--help']);
    expect(stdout).toContain('trigger');
    expect(stdout).toContain('tp-sl');
    expect(stdout).toContain('trailing');
    expect(stdout).toContain('list');
    expect(stdout).toContain('cancel');
  });

  it('futures position --help lists position subcommands', () => {
    const { stdout } = run(['futures', 'position', '--help']);
    expect(stdout).toContain('list');
    expect(stdout).toContain('leverage');
    expect(stdout).toContain('adjust-margin');
    expect(stdout).toContain('position-type');
  });

  it('futures account --help lists account subcommands', () => {
    const { stdout } = run(['futures', 'account', '--help']);
    expect(stdout).toContain('balance');
    expect(stdout).toContain('bills');
  });

  it('futures ws --help lists ws subcommands', () => {
    const { stdout } = run(['futures', 'ws', '--help']);
    expect(stdout).toContain('ticker');
    expect(stdout).toContain('depth');
    expect(stdout).toContain('klines');
    expect(stdout).toContain('user-stream');
  });

  it('futures order place --help shows all options', () => {
    const { stdout } = run(['futures', 'order', 'place', '--help']);
    expect(stdout).toContain('--symbol');
    expect(stdout).toContain('--side');
    expect(stdout).toContain('--type');
    expect(stdout).toContain('--price');
    expect(stdout).toContain('--quantity');
    expect(stdout).toContain('--position-side');
    expect(stdout).toContain('--time-in-force');
  });
});

describe('Auth error handling', () => {
  it('spot order open returns auth error JSON without credentials', () => {
    const { stdout, code } = run(['spot', 'order', 'open']);
    expect(code).not.toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(false);
    expect(parsed.error.code).toBe('AUTH_ERROR');
    expect(parsed.error.message).toContain('Missing API credentials');
  });

  it('futures account balance returns auth error JSON without credentials', () => {
    const { stdout, code } = run(['futures', 'account', 'balance']);
    expect(code).not.toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(false);
    expect(parsed.error.code).toBe('AUTH_ERROR');
  });
});
