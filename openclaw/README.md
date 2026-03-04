# OpenClaw Integration

This directory contains OpenClaw skill configuration for AZX CLI.

## Files

- `SKILL.md` - OpenClaw skill documentation
- `skill.json` - OpenClaw metadata (credentials, install methods)
- `references/` - Detailed reference documentation

## Quick Start for OpenClaw Users

```bash
# Install via ClawHub
clawhub install azx-cli

# Configure credentials
export AZX_API_KEY="your_api_key"
export AZX_SECRET_KEY="your_secret_key"

# Start trading
azx spot market ticker --symbol btc_usdt
```

See [SKILL.md](SKILL.md) for complete documentation.
