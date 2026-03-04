---
name: azx-cli
description: "Agent-First crypto trading CLI for AZX DEX (Spot + Futures) v0.1.0. Use when users need to: (1) Query crypto market data — prices, order books, klines, funding rates, open interest, (2) Manage spot and futures orders — create, cancel, batch, query, (3) Check account balances, positions, and trade history, (4) Stream real-time market data via WebSocket (NDJSON), (5) Manage futures leverage, margin mode, and conditional orders (trigger, TP/SL, trailing stop). Supports all AZX trading pairs. Structured JSON output by default."
metadata:
  {
    "openclaw":
      {
        "emoji": "📊",
        "requires": { "bins": ["azx"] },
        "primaryCredential":
          {
            "kind": "env",
            "env": "AZX_API_KEY",
            "description": "AZX API key from the AZX DEX platform",
          },
        "optionalEnvVars":
          [
            {
              "name": "AZX_SECRET_KEY",
              "description": "HMAC-SHA256 secret key for signing trading requests",
              "sensitive": true,
            },
            {
              "name": "AZX_SANDBOX",
              "description": "Set to 'true' to use sandbox/testnet environment",
              "sensitive": false,
            },
          ],
        "install":
          [
            {
              "id": "npm",
              "kind": "npm",
              "package": "azx-cli",
              "bins": ["azx"],
              "label": "Install AZX CLI via npm",
            },
          ],
      },
  }
---

# AZX CLI Skill

AZX CLI is an Agent-First command-line tool for the AZX DEX trading platform, supporting both Spot and Futures markets.

## Installation

### Option 1: ClawHub (Recommended - Auto-install)

```bash
clawhub install azx-cli
```

### Option 2: npm

```bash
npm install -g azx-cli
```

### Option 3: From Source

```bash
git clone https://github.com/wjllance/azx-cli.git
cd azx-cli
npm install && npm run build
npm link
```

## Quick Start

Check installation:

```bash
azx --version
```

View BTC spot price:

```bash
azx spot market ticker --symbol btc_usdt
```

## Authentication

Most trading and account commands require authentication. AZX CLI uses HMAC-SHA256 signing with API key + secret key.

### Environment Variables (Recommended)

The most secure way to authenticate. Credentials are not stored in shell history or command logs.

```bash
# Add to ~/.bashrc or ~/.zshrc
export AZX_API_KEY="your_api_key"
export AZX_SECRET_KEY="your_secret_key"

# Reload shell configuration
source ~/.bashrc
```

**Security Best Practices:**

- Never hardcode credentials in commands (appears in shell history)
- Never commit credentials to version control
- Rotate keys regularly
- Use separate profiles for production vs sandbox

### Get Credentials

Obtain your API key and secret key from the AZX DEX platform settings page.

### Verify Authentication

```bash
azx status
```

### Alternative Authentication Methods

#### CLI Flags (Per-command Override)

```bash
azx --api-key KEY --secret-key SECRET spot account balances
```

#### Config File

```bash
azx config set apiKey YOUR_API_KEY
azx config set secretKey YOUR_SECRET_KEY
```

**Credential Priority:** CLI flags > Environment variables > Config file

## Market Data (No auth required)

### Spot Market

```bash
# Ticker (single or all)
azx spot market ticker --symbol btc_usdt
azx spot market ticker

# Order book depth
azx spot market depth --symbol btc_usdt --limit 10

# Kline / candlestick data
azx spot market klines --symbol btc_usdt --interval 1h --limit 50

# Recent trades
azx spot market trades --symbol btc_usdt
```

### Futures Market

```bash
# Ticker
azx futures market ticker --symbol btc_usdt

# Order book
azx futures market depth --symbol btc_usdt --limit 20

# Klines
azx futures market klines --symbol btc_usdt --interval 4h

# Funding rate
azx futures market funding-rate --symbol btc_usdt

# Open interest
azx futures market open-interest --symbol btc_usdt
```

## Spot Trading (Auth required)

### Place Orders

```bash
# Limit buy
azx spot order place --symbol btc_usdt --side BUY --type LIMIT --price 50000 --quantity 0.001

# Market buy (by quote)
azx spot order place --symbol btc_usdt --side BUY --type MARKET --quote-quantity 100

# Market sell
azx spot order place --symbol btc_usdt --side SELL --type MARKET --quantity 0.001
```

### Manage Orders

```bash
# Cancel order
azx spot order cancel --symbol btc_usdt --order-id 123456

# Cancel all
azx spot order cancel-all --symbol btc_usdt

# Query order
azx spot order query --symbol btc_usdt --order-id 123456

# Open orders
azx spot order open --symbol btc_usdt

# Order history
azx spot order history --symbol btc_usdt --limit 20
```

### Batch Orders

```bash
# Place multiple orders
azx spot batch-order place --orders '[{"symbol":"btc_usdt","side":"BUY","type":"LIMIT","price":"50000","quantity":"0.001"}]'

# Cancel multiple orders
azx spot batch-order cancel --symbol btc_usdt --order-ids 111,222,333
```

### Spot Account

```bash
azx spot account balances
azx spot account deposit-address --coin USDT
azx spot account withdrawals --coin BTC --limit 10
azx spot account transfer --coin USDT --amount 100 --from spot --to futures
```

## Futures Trading (Auth required)

### Place Orders

```bash
# Limit long
azx futures order place --symbol btc_usdt --side BUY --type LIMIT --price 50000 --quantity 0.1 --position-side LONG

# Market close with reduce-only
azx futures order place --symbol btc_usdt --side SELL --type MARKET --quantity 0.1 --reduce-only
```

### Conditional Orders (Entrust)

```bash
# Trigger order
azx futures entrust trigger --symbol btc_usdt --side BUY --trigger-price 48000 --quantity 0.1

# Take-profit / Stop-loss
azx futures entrust tp-sl --symbol btc_usdt --side SELL --take-profit 55000 --stop-loss 45000

# Trailing stop
azx futures entrust trailing --symbol btc_usdt --side SELL --callback-rate 2 --activation-price 54000

# List / cancel
azx futures entrust list --symbol btc_usdt
azx futures entrust cancel --symbol btc_usdt --entrust-id 789
```

### Position Management

```bash
azx futures position list
azx futures position list --symbol btc_usdt
azx futures position leverage --symbol btc_usdt --leverage 10
azx futures position margin-mode --symbol btc_usdt --mode CROSSED
azx futures position adjust-margin --symbol btc_usdt --amount 50 --type ADD --side LONG
```

### Futures Account

```bash
azx futures account balance
azx futures account bills --limit 20
```

## Real-time Streaming

All WebSocket commands output NDJSON (one JSON object per line), ideal for piping to `jq` or other stream processors.

### Spot Streams (No auth for public)

```bash
azx spot ws ticker --symbol btc_usdt
azx spot ws depth --symbol btc_usdt
azx spot ws klines --symbol btc_usdt --interval 1m
azx spot ws trades --symbol btc_usdt
azx spot ws user-stream --listen-key YOUR_KEY
```

### Futures Streams

```bash
azx futures ws ticker --symbol btc_usdt
azx futures ws depth --symbol btc_usdt
azx futures ws klines --symbol btc_usdt --interval 1m
azx futures ws user-stream --listen-key YOUR_KEY
```

### Pipe to jq

```bash
azx spot ws ticker --symbol btc_usdt | jq '.data.lastPrice'
azx spot ws ticker --symbol btc_usdt | head -5
```

## Output Formats

```bash
# JSON (default) — structured for agents/scripts
azx spot market ticker --symbol btc_usdt --output json

# Table — human-readable
azx spot market ticker --symbol btc_usdt --output table

# CSV — for spreadsheets/data tools
azx spot market ticker --symbol btc_usdt --output csv

# Quiet — no output (check exit code only)
azx spot order place ... --output quiet && echo "Order placed"
```

### JSON Response Structure

Success:
```json
{ "ok": true, "data": { ... } }
```

Error:
```json
{ "ok": false, "error": { "code": "AUTH_ERROR", "message": "..." } }
```

## Configuration

```bash
azx config init                          # Create config file
azx config set <key> <value>             # Set a value
azx config get <key>                     # Get a value
azx config list                          # Show all config
azx config path                          # Show config file path
azx status                               # Check connectivity & auth
```

### Multi-Profile Support

```bash
azx config set apiKey KEY1 --profile production
azx config set apiKey KEY2 --profile testnet
azx --profile production spot account balances
azx --profile testnet --sandbox spot account balances
```

## Global Options

| Option | Description | Default |
|---|---|---|
| `--profile <name>` | Configuration profile | `default` |
| `--output <format>` | `json` \| `table` \| `csv` \| `quiet` | `json` |
| `--sandbox` | Use sandbox/testnet endpoints | `false` |
| `--verbose` | Debug logging to stderr | `false` |
| `--api-key <key>` | Override API key | — |
| `--secret-key <key>` | Override Secret key | — |

## References

- [API Documentation](references/api-docs.md)
- [Authentication Details](references/authentication.md)
- [Command Examples](references/examples.md)
- [Troubleshooting](references/troubleshooting.md)

## Links

- GitHub: https://github.com/wjllance/azx-cli
- Issues: https://github.com/wjllance/azx-cli/issues
