# Security Checklist for azx-cli

## Before Installing

### 1. Verify the Source

Ensure you are installing from the official repository:

```bash
# Check the npm package
npm info azx-cli

# Or clone and inspect the source
git clone https://github.com/wjllance/azx-cli.git
cd azx-cli
```

**Check for:**
- Download source matches `github.com/wjllance/azx-cli`
- Package checksum is valid
- No suspicious post-install scripts in `package.json`

### 2. Inspect Before Installing

```bash
# Download without installing
npm pack azx-cli

# Inspect contents
tar -tzf azx-cli-*.tgz

# Look for suspicious scripts
cat package.json | jq '.scripts'
```

### 3. Protect Your Credentials

**Never:**
- Paste API keys or secret keys directly into shell commands (leaks to history)
- Commit credentials to Git/VCS
- Share credentials in chat or email
- Store credentials in unencrypted files with world-readable permissions

**Always:**
- Use environment variables
- Use a secure secrets manager
- Set file permissions to 600 for credential files

```bash
# Good: Environment variables
export AZX_API_KEY="your_key"
export AZX_SECRET_KEY="your_secret"

# Good: Config file with restricted permissions
azx config set apiKey YOUR_KEY
azx config set secretKey YOUR_SECRET
chmod 600 ~/.config/azx-cli/config.json

# Bad: Command line arguments (leaks to shell history)
azx --api-key "your_key" --secret-key "your_secret" spot account balances
```

### 4. Test Before Trading

Because this is a **trading tool**:

1. **Start with read-only commands:**
   ```bash
   azx spot market ticker --symbol btc_usdt    # No auth needed
   azx status                                   # Check connectivity
   ```

2. **Use sandbox/testnet first:**
   ```bash
   azx --sandbox spot market ticker --symbol btc_usdt
   azx --sandbox spot account balances
   ```

3. **Verify with small amounts first**

4. **Only then authorize with real funds on production**

### 5. Sandbox Environment

Always test trading operations in sandbox first:

```bash
# Configure sandbox profile
azx config set apiKey SANDBOX_KEY --profile testnet
azx config set secretKey SANDBOX_SECRET --profile testnet
azx config set sandbox true --profile testnet

# Use sandbox
azx --profile testnet --sandbox spot order place --symbol btc_usdt --side BUY --type MARKET --quantity 0.001
```

## Higher Assurance Steps

For maximum security:

1. **Review the GitHub repository:**
   - https://github.com/wjllance/azx-cli
   - Check source code
   - Review dependencies

2. **Build from source:**
   ```bash
   git clone https://github.com/wjllance/azx-cli.git
   cd azx-cli
   npm install
   npm run build
   npm link
   ```

3. **Audit dependencies:**
   ```bash
   npm audit
   ```

4. **Use ClawHub installation (recommended):**
   ```bash
   clawhub install azx-cli
   ```

## Red Flags to Watch For

Stop and verify if you see:
- Download URLs not from `github.com/wjllance/azx-cli`
- Suspicious post-install scripts
- Requests for credentials in unexpected places
- Outbound network connections to unknown hosts (use `--verbose` to monitor)

## Reporting Issues

If you discover security concerns:
- GitHub Issues: https://github.com/wjllance/azx-cli/issues
