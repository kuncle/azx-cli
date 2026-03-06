# azx-cli

**Give your AI agent the ability to trade on AZX DEX — in one command.**

An Agent-First CLI for AZX DEX (Spot + Futures). Structured JSON output, machine-readable errors, NDJSON WebSocket streams. Zero interaction — fully scriptable, ready for autonomous agents.

## Install

```bash
# via ClawHub (recommended for agents)
clawhub install azx-cli

# via npm
npm install -g azx-cli
```

Requires Node.js >= 20.

## Setup (30 seconds)

```bash
# 1. Set credentials (environment variables — recommended)
export AZX_API_KEY="your_api_key"
export AZX_SECRET_KEY="your_secret_key"

# 2. Verify
azx status
```

That's it. Your agent can now trade.

> **Credential priority:** CLI flags (`--api-key`, `--secret-key`) > Environment variables > Config file
>
> Alternative: `azx config set apiKey KEY && azx config set secretKey SECRET`

## Why Agent-First?

| Feature | Detail |
|---|---|
| **stdout = data** | All output is structured JSON by default. Logs go to stderr. Safe to pipe. |
| **Machine-readable errors** | `{ "ok": false, "error": { "code": "AUTH_ERROR", "message": "..." } }` |
| **Deterministic exit codes** | 0 = success, 2 = auth error, 4 = API error, 6 = validation error, etc. |
| **No prompts, ever** | Every command is non-interactive. No confirmations, no wizards. |
| **NDJSON streaming** | WebSocket streams output one JSON object per line — easy to process. |
| **Sandbox mode** | Test strategies risk-free with `--sandbox`. |

## Quick Examples

```bash
# Market data (no auth needed)
azx spot market ticker -s btc_usdt
azx futures market funding-rate -s btc_usdt

# Place a spot order
azx spot order place -s btc_usdt --side BUY --type MARKET --quantity 0.001

# Open a futures long
azx futures order place -s btc_usdt --side BUY --type LIMIT \
  --price 50000 --quantity 0.1 --position-side LONG

# Stream real-time prices (NDJSON)
azx spot ws ticker -s btc_usdt | jq '.data.lastPrice'

# Check account
azx spot account balances
azx futures account balance
```

## Agent Integration Pattern

```bash
# Parse JSON output
PRICE=$(azx spot market ticker -s btc_usdt | jq -r '.data.lastPrice')

# Use exit codes for control flow
if azx status --output quiet; then
  azx spot order place -s btc_usdt --side BUY --type MARKET --quantity 0.001
fi

# Stream market data into your pipeline
azx spot ws ticker -s btc_usdt | while read -r line; do
  echo "$line" | jq -r '.data | "\(.symbol): \(.lastPrice)"'
done
```

### JSON Response Format

```jsonc
// Success
{ "ok": true, "data": { /* ... */ } }

// Error
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

### Exit Codes

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

## Commands

### Spot

| Command | Description |
|---|---|
| `spot market ticker [-s SYMBOL]` | Price ticker (single or all) |
| `spot market depth -s SYMBOL` | Order book |
| `spot market klines -s SYMBOL -i INTERVAL` | Candlestick data |
| `spot market trades -s SYMBOL` | Recent trades |
| `spot order place -s SYMBOL --side --type ...` | Place order |
| `spot order cancel -s SYMBOL --order-id ID` | Cancel order |
| `spot order cancel-all -s SYMBOL` | Cancel all orders |
| `spot order open -s SYMBOL` | List open orders |
| `spot order history -s SYMBOL` | Order history |
| `spot batch-order place --orders JSON` | Batch place orders |
| `spot batch-order cancel -s SYMBOL --order-ids` | Batch cancel |
| `spot account balances` | Account balances |
| `spot account deposit-address --coin COIN` | Deposit address |
| `spot account withdrawals --coin COIN` | Withdrawal history |
| `spot account transfer --coin --amount --from --to` | Internal transfer |
| `spot ws ticker -s SYMBOL` | Stream ticker (NDJSON) |
| `spot ws depth -s SYMBOL` | Stream order book |
| `spot ws klines -s SYMBOL -i INTERVAL` | Stream klines |
| `spot ws trades -s SYMBOL` | Stream trades |

### Futures

| Command | Description |
|---|---|
| `futures market ticker [-s SYMBOL]` | Price ticker |
| `futures market depth -s SYMBOL` | Order book |
| `futures market klines -s SYMBOL -i INTERVAL` | Candlestick data |
| `futures market funding-rate -s SYMBOL` | Funding rate |
| `futures market open-interest -s SYMBOL` | Open interest |
| `futures market mark-price [-s SYMBOL]` | Mark price |
| `futures market index-price [-s SYMBOL]` | Index price |
| `futures market symbols` | List trading pairs |
| `futures market deals -s SYMBOL` | Recent trades |
| `futures order place -s SYMBOL --side --type ...` | Place order |
| `futures order cancel -s SYMBOL --order-id ID` | Cancel order |
| `futures order cancel-all -s SYMBOL` | Cancel all |
| `futures order open` | Open orders |
| `futures order history` | Order history |
| `futures entrust trigger -s SYMBOL ...` | Trigger order |
| `futures entrust tp-sl -s SYMBOL ...` | Take-profit / Stop-loss |
| `futures entrust trailing -s SYMBOL ...` | Trailing stop |
| `futures position list [-s SYMBOL]` | List positions |
| `futures position leverage -s SYMBOL --leverage N` | Set leverage |
| `futures position adjust-margin -s SYMBOL ...` | Adjust margin |
| `futures position close-all` | Close all positions |
| `futures account balance` | Account balance |
| `futures account bills` | Transaction bills |
| `futures ws ticker -s SYMBOL` | Stream ticker (NDJSON) |
| `futures ws depth -s SYMBOL` | Stream order book |
| `futures ws klines -s SYMBOL -i INTERVAL` | Stream klines |

### Config & Status

| Command | Description |
|---|---|
| `config init` | Create config file |
| `config set KEY VALUE` | Set config value |
| `config get KEY` | Get config value |
| `config list` | Show all config |
| `config path` | Show config file path |
| `status` | Check connectivity and auth |

## Global Options

| Option | Description | Default |
|---|---|---|
| `--profile <name>` | Configuration profile | `default` |
| `--output <format>` | `json` \| `table` \| `csv` \| `quiet` | `json` |
| `--sandbox` | Use sandbox/testnet environment | `false` |
| `--verbose` | Debug logging to stderr | `false` |
| `--api-key <key>` | Override API key | — |
| `--secret-key <key>` | Override Secret key | — |

## API Endpoints

| Environment | Spot | Futures |
|---|---|---|
| Production | `s-api.azverse.xyz` / `s-ws.azverse.xyz` | `f-api.azverse.xyz` / `f-ws.azverse.xyz` |
| Sandbox | `s-api.az-qa.xyz` / `s-ws.az-qa.xyz` | `f-api.az-qa.xyz` / `f-ws.az-qa.xyz` |

## Development

```bash
git clone <repo-url> && cd azx-cli
npm install
npm run build
npm link        # link globally as 'azx'
npm run dev     # watch mode
npm test        # run tests
```

## License

MIT
