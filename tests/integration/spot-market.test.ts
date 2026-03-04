import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const CLI = resolve(import.meta.dirname, '../../bin/azx.js');

function runCli(args: string[]): string {
  try {
    return execFileSync('node', [CLI, ...args], { encoding: 'utf-8', timeout: 5000 });
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    return (err.stdout ?? '') + (err.stderr ?? '');
  }
}

describe('Spot Market Commands (integration)', () => {
  it('should display help for spot market ticker', () => {
    const output = runCli(['spot', 'market', 'ticker', '--help']);
    expect(output).toContain('ticker');
    expect(output).toContain('--symbol');
  });

  it('should display help for spot command group', () => {
    const output = runCli(['spot', '--help']);
    expect(output).toContain('market');
    expect(output).toContain('order');
    expect(output).toContain('account');
  });

  it('should display help for futures command group', () => {
    const output = runCli(['futures', '--help']);
    expect(output).toContain('market');
    expect(output).toContain('order');
    expect(output).toContain('position');
    expect(output).toContain('entrust');
  });

  it('should show version', () => {
    const output = runCli(['--version']);
    expect(output.trim()).toBe('0.1.0');
  });
});
