# Command Examples

## Market Data Examples

### Get BTC Spot Price

```bash
azx spot market ticker --symbol btc_usdt
```

### Get All Spot Tickers

```bash
azx spot market ticker
```

### Get Order Book (Top 10)

```bash
azx spot market depth --symbol btc_usdt --limit 10
```

### Get 1-Hour Klines (Last 50)

```bash
azx spot market klines --symbol btc_usdt --interval 1h --limit 50
```

### Get Daily Klines

```bash
azx spot market klines --symbol btc_usdt --interval 1d --limit 30
```

### Get Futures Funding Rate

```bash
azx futures market funding-rate --symbol btc_usdt
```

### Get Futures Open Interest

```bash
azx futures market open-interest --symbol btc_usdt
```

## Spot Trading Examples

### Limit Buy Order

```bash
azx spot order place --symbol btc_usdt --side BUY --type LIMIT --price 50000 --quantity 0.001
```

### Market Buy (by Quote Amount)

```bash
azx spot order place --symbol btc_usdt --side BUY --type MARKET --quote-quantity 100
```

### Market Sell

```bash
azx spot order place --symbol btc_usdt --side SELL --type MARKET --quantity 0.001
```

### Cancel Specific Order

```bash
azx spot order cancel --symbol btc_usdt --order-id 123456
```

### Cancel All Orders

```bash
azx spot order cancel-all --symbol btc_usdt
```

### Batch Place Orders

```bash
azx spot batch-order place --orders '[
  {"symbol":"btc_usdt","side":"BUY","type":"LIMIT","price":"49000","quantity":"0.001"},
  {"symbol":"btc_usdt","side":"BUY","type":"LIMIT","price":"48000","quantity":"0.002"}
]'
```

## Futures Trading Examples

### Open Long Position

```bash
azx futures order place --symbol btc_usdt --side BUY --type LIMIT --price 50000 --quantity 0.1 --position-side LONG
```

### Close with Market (Reduce-Only)

```bash
azx futures order place --symbol btc_usdt --side SELL --type MARKET --quantity 0.1 --reduce-only
```

### Set Leverage

```bash
azx futures position leverage --symbol btc_usdt --leverage 10
```

### Set Margin Mode

```bash
azx futures position margin-mode --symbol btc_usdt --mode ISOLATED
```

### Place Trigger Order

```bash
azx futures entrust trigger --symbol btc_usdt --side BUY --trigger-price 48000 --quantity 0.1
```

### Set TP/SL

```bash
azx futures entrust tp-sl --symbol btc_usdt --side SELL --take-profit 55000 --stop-loss 45000
```

## Account Examples

### Check Spot Balances

```bash
azx spot account balances
```

### Check Futures Balance

```bash
azx futures account balance
```

### View Positions

```bash
azx futures position list
azx futures position list --symbol btc_usdt
```

### View Order History

```bash
azx spot order history --symbol btc_usdt --limit 50
azx futures order history --limit 20
```

### Transfer Between Accounts

```bash
azx spot account transfer --coin USDT --amount 100 --from spot --to futures
```

## Streaming Examples

### Spot Price Stream

```bash
azx spot ws ticker --symbol btc_usdt
```

### Futures Depth Stream

```bash
azx futures ws depth --symbol btc_usdt
```

### Pipe to jq

```bash
azx spot ws ticker --symbol btc_usdt | jq '.data.lastPrice'
```

### Capture First 5 Updates

```bash
azx spot ws ticker --symbol btc_usdt | head -5
```

## Output Format Examples

### JSON Output (Default)

```bash
azx spot market ticker --symbol btc_usdt --output json
```

### Table Output

```bash
azx spot market ticker --symbol btc_usdt --output table
```

### CSV Export

```bash
azx spot order history --symbol btc_usdt --output csv > orders.csv
```

### Quiet Mode (Scripting)

```bash
azx spot order place ... --output quiet && echo "Order placed"
```

## Scripting Examples

### Get Price as Plain Text

```bash
azx spot market ticker --symbol btc_usdt | jq -r '.data.lastPrice'
```

### Monitor Price Loop

```bash
while true; do
  azx spot market ticker --symbol btc_usdt | jq -r '.data | "\(.symbol): \(.lastPrice)"'
  sleep 5
done
```

### Conditional Order

```bash
azx status --output quiet && \
  azx spot order place --symbol btc_usdt --side BUY --type MARKET --quantity 0.001
```
