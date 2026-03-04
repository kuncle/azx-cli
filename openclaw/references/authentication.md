# Authentication Details

## API Key + Secret Key

AZX CLI uses HMAC-SHA256 signing with an API key and secret key pair.

### Obtaining Credentials

1. Log in to the AZX DEX platform
2. Navigate to API management settings
3. Generate a new API key pair
4. Copy both the API key and secret key

### Credential Properties

- **API Key**: Public identifier for your account
- **Secret Key**: Used for HMAC-SHA256 signing (never share this)
- **Scope**: Market data (public), trading, account management

### Environment Variable Setup (Recommended)

```bash
# Add to ~/.bashrc or ~/.zshrc
export AZX_API_KEY="your_api_key"
export AZX_SECRET_KEY="your_secret_key"

# Reload configuration
source ~/.bashrc
```

## Signing Algorithm

AZX uses two slightly different HMAC-SHA256 signing algorithms:

### Spot Signing

1. Sort `validate-*` headers alphabetically
2. Join as `key=value` pairs with `&`
3. Append `#METHOD#path#query#body`
4. HMAC-SHA256 with secret key

### Futures Signing

1. Build prefix: `validate-appkey={key}&validate-timestamp={ts}`
2. Append `#METHOD#path#query#body`
3. HMAC-SHA256 with secret key

### Signed Headers

All signed requests include:

| Header | Description |
|---|---|
| `validate-appkey` | API key |
| `validate-timestamp` | Request timestamp (ms) |
| `validate-signature` | HMAC-SHA256 signature |
| `validate-recvwindow` | Receive window (default 5000ms) |
| `validate-algorithms` | `HmacSHA256` |

## Credential Priority

Credentials are loaded in order of priority:

1. **CLI flags** — `--api-key` and `--secret-key`
2. **Environment variables** — `AZX_API_KEY` and `AZX_SECRET_KEY`
3. **Config file** — `~/.config/azx-cli/config.json`

## Multi-Profile Support

```bash
# Set credentials for different profiles
azx config set apiKey KEY_PROD --profile production
azx config set secretKey SECRET_PROD --profile production
azx config set apiKey KEY_TEST --profile testnet

# Use specific profile
azx --profile production spot account balances
azx --profile testnet --sandbox spot account balances
```

## Security Best Practices

1. **Never commit credentials to git**
2. **Use environment variables** (not command-line arguments for scripts)
3. **Rotate keys regularly**
4. **Use separate API keys** for different environments
5. **Restrict API key permissions** when possible

## Troubleshooting Authentication

### "Missing API credentials" Error

- Check if `AZX_API_KEY` is set: `echo $AZX_API_KEY`
- Check if `AZX_SECRET_KEY` is set: `echo $AZX_SECRET_KEY`
- Run `azx status` to diagnose
- Try explicit flags: `azx --api-key KEY --secret-key SECRET status`

### "Invalid signature" Error

- Verify your secret key is correct
- Check system clock is synchronized (timestamps are validated)
- Ensure you're using the correct environment (production vs sandbox)
