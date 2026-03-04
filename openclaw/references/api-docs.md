# API Documentation

## Overview

AZX CLI provides a command-line interface to the AZX DEX exchange API, supporting both Spot and Futures markets.

## Base URLs

| Environment | Spot REST | Futures REST | Spot WS | Futures WS |
|---|---|---|---|---|
| Production | `https://s-api.azverse.xyz` | `https://f-api.azverse.xyz` | `wss://s-ws.azverse.xyz` | `wss://f-ws.azverse.xyz` |
| Sandbox | `https://s-api.az-qa.xyz` | `https://f-api.az-qa.xyz` | `wss://s-ws.az-qa.xyz` | `wss://f-ws.az-qa.xyz` |

Switch to sandbox with `--sandbox` flag.

## Authentication

All trading and account endpoints require HMAC-SHA256 signed requests.

See [Authentication Details](authentication.md) for more information.

## Rate Limits

Respect the exchange rate limits. Use WebSocket streams for real-time data instead of polling REST endpoints.

## Spot Endpoints

### Market Data (No auth)

| Command | Description |
|---|---|
| `azx spot market ticker` | Get ticker price (single or all pairs) |
| `azx spot market depth -s <symbol>` | Order book depth |
| `azx spot market klines -s <symbol> -i <interval>` | Candlestick / kline data |
| `azx spot market trades -s <symbol>` | Recent trades |

### Orders (Auth required)

| Command | Description |
|---|---|
| `azx spot order place` | Place a new order |
| `azx spot order cancel` | Cancel an order |
| `azx spot order cancel-all` | Cancel all orders for a symbol |
| `azx spot order query` | Query order details |
| `azx spot order open` | List open orders |
| `azx spot order history` | Get order history |
| `azx spot batch-order place` | Place multiple orders |
| `azx spot batch-order cancel` | Cancel multiple orders |

### Account (Auth required)

| Command | Description |
|---|---|
| `azx spot account balances` | Get account balances |
| `azx spot account deposit-address` | Get deposit address |
| `azx spot account withdrawals` | Get withdrawal history |
| `azx spot account transfer` | Transfer between accounts |

## Futures Endpoints

### Market Data (No auth)

| Command | Description |
|---|---|
| `azx futures market ticker` | Get futures ticker |
| `azx futures market depth -s <symbol>` | Futures order book |
| `azx futures market klines -s <symbol> -i <interval>` | Futures kline data |
| `azx futures market funding-rate -s <symbol>` | Funding rate |
| `azx futures market open-interest -s <symbol>` | Open interest |

### Orders (Auth required)

| Command | Description |
|---|---|
| `azx futures order place` | Place a futures order |
| `azx futures order cancel` | Cancel a futures order |
| `azx futures order cancel-all` | Cancel all futures orders |
| `azx futures order query` | Query futures order |
| `azx futures order open` | List open futures orders |
| `azx futures order history` | Futures order history |

### Conditional Orders / Entrust (Auth required)

| Command | Description |
|---|---|
| `azx futures entrust trigger` | Place trigger order |
| `azx futures entrust tp-sl` | Take-profit / stop-loss |
| `azx futures entrust trailing` | Trailing stop order |
| `azx futures entrust list` | List entrust orders |
| `azx futures entrust cancel` | Cancel entrust order |

### Position (Auth required)

| Command | Description |
|---|---|
| `azx futures position list` | List positions |
| `azx futures position leverage` | Set leverage |
| `azx futures position margin-mode` | Set margin mode |
| `azx futures position adjust-margin` | Adjust position margin |

### Account (Auth required)

| Command | Description |
|---|---|
| `azx futures account balance` | Get futures balance |
| `azx futures account bills` | Get transaction history |

## Exit Codes

| Code | Description |
|---|---|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error |
| 3 | Configuration error |
| 4 | API error |
| 5 | Network error |
| 6 | Validation error |
| 7 | Not found |
| 8 | Rate limited |
