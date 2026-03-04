# azx-cli

Agent-First CLI for AZX DEX trading platform (Spot + Futures).

Designed for scripting and automation — all output is structured JSON by default, errors are machine-parseable, and every operation is non-interactive.

## Features

- **Spot & Futures trading** — market data, orders, positions, account management
- **Structured output** — JSON (default), table, CSV, quiet
- **stdout = data, stderr = logs** — safe to pipe and compose
- **WebSocket streaming** — real-time market data as NDJSON
- **Multi-profile config** — XDG-compatible, per-environment settings
- **Sandbox support** — test against AZX sandbox with `--sandbox`
- **Zero interaction** — fully scriptable, no prompts

## Requirements

- Node.js >= 20

## Installation

```bash
# From source
git clone <repo-url> && cd azx-cli
npm install
npm run build

# Run directly
node bin/azx.js --help

# Or link globally
npm link
azx --help
```

## Quick Start

```bash
# 1. Initialize config
azx config init

# 2. Set API credentials
azx config set apiKey YOUR_API_KEY
azx config set secretKey YOUR_SECRET_KEY

# 3. Check connectivity
azx status

# 4. Get spot ticker
azx spot market ticker --symbol btc_usdt

# 5. Get futures funding rate
azx futures market funding-rate --symbol btc_usdt
```

## Configuration

Config is stored at `~/.config/azx-cli/config.json` (XDG-compatible).

Credential priority: **CLI flags > Environment variables > Config file**

```bash
# Via environment variables
export AZX_API_KEY=your-key
export AZX_SECRET_KEY=your-secret

# Via CLI flags (per-command override)
azx --api-key KEY --secret-key SECRET spot account balances

# Via config file
azx config set apiKey YOUR_KEY --profile default
azx config set secretKey YOUR_SECRET --profile default
azx config set sandbox true --profile testnet
```

### Config Commands

```bash
azx config init                          # Create config file
azx config set <key> <value>             # Set a value
azx config get <key>                     # Get a value
azx config list                          # Show full config
azx config list --profile production     # Show specific profile
azx config path                          # Show config file path
```

## Global Options

| Option | Description | Default |
|---|---|---|
| `--profile <name>` | Configuration profile | `default` |
| `--output <format>` | Output format: `json` \| `table` \| `csv` \| `quiet` | `json` |
| `--sandbox` | Use sandbox/testnet environment | `false` |
| `--verbose` | Debug logging to stderr | `false` |
| `--api-key <key>` | Override API key | — |
| `--secret-key <key>` | Override Secret key | — |

## Commands

### Status

```bash
azx status                    # Check API connectivity and config
azx status --sandbox          # Check sandbox endpoints
```

### Spot Market Data

```bash
azx spot market ticker                          # All tickers
azx spot market ticker -s btc_usdt              # Single ticker
azx spot market depth -s btc_usdt -l 10         # Order book (top 10)
azx spot market klines -s btc_usdt -i 1h -l 50  # Kline/candlestick data
azx spot market trades -s btc_usdt              # Recent trades
```

### Spot Orders

```bash
# Place orders
azx spot order place -s btc_usdt --side BUY --type LIMIT --price 50000 --quantity 0.001
azx spot order place -s btc_usdt --side BUY --type MARKET --quote-quantity 100

# Manage orders
azx spot order cancel -s btc_usdt --order-id 123456
azx spot order cancel-all -s btc_usdt
azx spot order query -s btc_usdt --order-id 123456
azx spot order open -s btc_usdt
azx spot order history -s btc_usdt --limit 20

# Batch operations
azx spot batch-order place --orders '[{"symbol":"btc_usdt","side":"BUY","type":"LIMIT","price":"50000","quantity":"0.001"}]'
azx spot batch-order cancel -s btc_usdt --order-ids 111,222,333
```

### Spot Account

```bash
azx spot account balances
azx spot account deposit-address --coin USDT
azx spot account withdrawals --coin BTC --limit 10
azx spot account transfer --coin USDT --amount 100 --from spot --to futures
```

### Futures Market Data

```bash
azx futures market ticker -s btc_usdt
azx futures market depth -s btc_usdt -l 20
azx futures market klines -s btc_usdt -i 4h
azx futures market funding-rate -s btc_usdt
azx futures market open-interest -s btc_usdt
```

### Futures Orders

```bash
azx futures order place -s btc_usdt --side BUY --type LIMIT --price 50000 --quantity 0.1 --position-side LONG
azx futures order place -s btc_usdt --side SELL --type MARKET --quantity 0.1 --reduce-only
azx futures order cancel -s btc_usdt --order-id 123456
azx futures order cancel-all -s btc_usdt
azx futures order open
azx futures order history --limit 50
```

### Futures Conditional Orders (Entrust)

```bash
# Trigger order
azx futures entrust trigger -s btc_usdt --side BUY --trigger-price 48000 --quantity 0.1

# Take-profit / Stop-loss
azx futures entrust tp-sl -s btc_usdt --side SELL --take-profit 55000 --stop-loss 45000

# Trailing stop
azx futures entrust trailing -s btc_usdt --side SELL --callback-rate 2 --activation-price 54000

# Manage
azx futures entrust list -s btc_usdt
azx futures entrust cancel -s btc_usdt --entrust-id 789
```

### Futures Positions

```bash
azx futures position list
azx futures position list -s btc_usdt
azx futures position leverage -s btc_usdt --leverage 10
azx futures position margin-mode -s btc_usdt --mode CROSSED
azx futures position adjust-margin -s btc_usdt --amount 50 --type ADD --side LONG
```

### Futures Account

```bash
azx futures account balance
azx futures account bills --limit 20
```

### WebSocket Streaming

All WebSocket commands output NDJSON (one JSON object per line), ideal for piping to `jq` or other processors.

```bash
# Spot streams
azx spot ws ticker -s btc_usdt
azx spot ws depth -s btc_usdt
azx spot ws klines -s btc_usdt -i 1m
azx spot ws trades -s btc_usdt
azx spot ws user-stream --listen-key YOUR_KEY

# Futures streams
azx futures ws ticker -s btc_usdt
azx futures ws depth -s btc_usdt
azx futures ws klines -s btc_usdt -i 1m
azx futures ws user-stream --listen-key YOUR_KEY

# Pipe to jq
azx spot ws ticker -s btc_usdt | jq '.data.lastPrice'

# Capture first 5 updates
azx spot ws ticker -s btc_usdt | head -5
```

## Output Formats

```bash
# JSON (default) — structured for agents/scripts
azx spot market ticker -s btc_usdt --output json

# Table — human-readable
azx spot market ticker -s btc_usdt --output table

# CSV — for spreadsheets/data tools
azx spot market ticker -s btc_usdt --output csv

# Quiet — no output (check exit code only)
azx spot order place ... --output quiet && echo "Order placed"
```

### JSON Response Structure

Success:
```json
{
  "ok": true,
  "data": { ... }
}
```

Error:
```json
{
  "ok": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Missing API credentials..."
  }
}
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error |
| 3 | Configuration error |
| 4 | API error |
| 5 | Network error |
| 6 | Validation error |
| 7 | Not found |
| 8 | Rate limited |

## API Endpoints

| Environment | Spot REST | Futures REST | Spot WS | Futures WS |
|---|---|---|---|---|
| Production | s-api.azverse.xyz | f-api.azverse.xyz | s-ws.azverse.xyz | f-ws.azverse.xyz |
| Sandbox | s-api.az-qa.xyz | f-api.az-qa.xyz | s-ws.az-qa.xyz | f-ws.az-qa.xyz |

## Scripting Examples

```bash
# Get BTC price as plain text
azx spot market ticker -s btc_usdt | jq -r '.data.lastPrice'

# Monitor price in a loop
while true; do
  azx spot market ticker -s btc_usdt | jq -r '.data | "\(.symbol): \(.lastPrice)"'
  sleep 5
done

# Place order only if status check passes
azx status --output quiet && \
  azx spot order place -s btc_usdt --side BUY --type MARKET --quantity 0.001

# Export order history to CSV
azx spot order history -s btc_usdt --output csv > orders.csv

# Use different profiles for different environments
azx --profile production spot account balances
azx --profile testnet --sandbox spot account balances
```

## Development

```bash
npm install          # Install dependencies
npm run build        # Build with tsup
npm run dev          # Watch mode
npm test             # Run tests
npm run lint         # Type check
```

## Project Structure

```
src/
├── index.ts                 # Entry point
├── cli.ts                   # Root command + global options
├── commands/
│   ├── config.cmd.ts        # azx config
│   ├── status.cmd.ts        # azx status
│   ├── spot/                # azx spot market/order/batch-order/account/ws
│   └── futures/             # azx futures market/order/entrust/position/account/ws
├── client/
│   ├── base-client.ts       # Abstract HTTP client (signing, retry, errors)
│   ├── spot-client.ts       # Spot REST API client
│   └── futures-client.ts    # Futures REST API client
├── auth/
│   ├── signer.ts            # HMAC-SHA256 signing (Spot + Futures)
│   └── credentials.ts       # Credential loading chain
├── websocket/
│   ├── base-ws.ts           # WebSocket base (reconnect, heartbeat, NDJSON)
│   ├── spot-ws.ts           # Spot WebSocket streams
│   └── futures-ws.ts        # Futures WebSocket streams
├── output/
│   └── formatter.ts         # json / table / csv / quiet
├── config/
│   └── config-manager.ts    # XDG-compatible config management
├── models/                  # TypeScript type definitions
├── error/                   # Structured error handling + exit codes
└── utils/                   # Logger (stderr-only), retry, helpers
```

## License

MIT
