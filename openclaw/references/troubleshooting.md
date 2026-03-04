# Troubleshooting

## Common Issues

### Command not found: azx

**Problem**: `azx` command not recognized

**Solutions**:
1. Verify installation: `which azx`
2. If installed from source, ensure you ran `npm link`
3. Check Node.js version: `node --version` (requires >= 20)
4. Reinstall: `npm install -g azx-cli`

### Authentication Failed

**Problem**: "Missing API credentials" error

**Solutions**:
1. Check env vars are set: `echo $AZX_API_KEY`
2. Run `azx status` to diagnose auth status
3. Set credentials via config: `azx config set apiKey YOUR_KEY`
4. Reload shell config: `source ~/.bashrc`
5. Try explicit flags: `azx --api-key KEY --secret-key SECRET status`

### Invalid Signature

**Problem**: API returns signature verification failure

**Solutions**:
1. Verify your secret key is correct
2. Check system clock is synchronized — timestamps must be within 5 seconds
3. Ensure you're targeting the correct environment (production vs sandbox)
4. Try with `--verbose` to see the signing details

### Rate Limit Exceeded

**Problem**: API returns rate limit errors

**Solutions**:
1. Reduce request frequency
2. Use WebSocket streams for real-time data: `azx spot ws ticker -s btc_usdt`
3. Cache responses when appropriate

### Connection Timeout / Network Error

**Problem**: Network-related errors

**Solutions**:
1. Check internet connection
2. Run `azx status` to check endpoint connectivity
3. Try sandbox environment: `azx status --sandbox`
4. Check if API endpoints are accessible: `curl -s https://f-api.azverse.xyz/api/futures/v1/market/ticker`

### Config File Issues

**Problem**: Config not loading or invalid

**Solutions**:
1. Check config path: `azx config path`
2. Re-initialize: `azx config init`
3. View current config: `azx config list`
4. Config file location: `~/.config/azx-cli/config.json`

## Debug Mode

Enable verbose output to see request details, signing info, and response data:

```bash
azx --verbose spot market ticker --symbol btc_usdt
```

Debug logs go to **stderr** only, so they won't interfere with JSON output on stdout:

```bash
# JSON still clean on stdout, debug on stderr
azx --verbose spot market ticker --symbol btc_usdt 2>/dev/null | jq .
```

## Exit Codes

Use exit codes for scripting:

| Code | Meaning |
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

```bash
azx spot market ticker --symbol btc_usdt
echo "Exit code: $?"
```

## Getting Help

1. Check command help: `azx --help`
2. Check subcommand help: `azx spot --help`, `azx spot market --help`
3. Visit GitHub Issues: https://github.com/wjllance/azx-cli/issues

## Reporting Bugs

When reporting issues, include:

1. AZX CLI version: `azx --version`
2. Node.js version: `node --version`
3. Operating system
4. Command that failed
5. Error output (with `--verbose` flag)
6. Steps to reproduce
