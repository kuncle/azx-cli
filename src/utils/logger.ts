let verboseEnabled = false;

export function setVerbose(enabled: boolean) {
  verboseEnabled = enabled;
}

export function isVerbose(): boolean {
  return verboseEnabled;
}

/** Log to stderr only – never pollutes stdout data channel */
export const logger = {
  debug(...args: unknown[]) {
    if (verboseEnabled) {
      console.error('[DEBUG]', ...args);
    }
  },
  info(...args: unknown[]) {
    if (verboseEnabled) {
      console.error('[INFO]', ...args);
    }
  },
  warn(...args: unknown[]) {
    console.error('[WARN]', ...args);
  },
  error(...args: unknown[]) {
    console.error('[ERROR]', ...args);
  },
};
