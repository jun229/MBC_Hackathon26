# Setup Guide - The Flake Fund

Complete setup instructions for local development and deployment.

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org))
- **Rust** 1.70+ ([Install](https://rustup.rs))
- **Solana CLI** 1.17+ ([Install](https://docs.solana.com/cli/install-solana-cli-tools))
- **Anchor** 0.29+ ([Install](https://www.anchor-lang.com/docs/installation))
- **Git** ([Install](https://git-scm.com/downloads))
- **Phantom Wallet** ([Install](https://phantom.app))

## Quick Verification

```bash
# Check installations
node --version    # Should be v18+
cargo --version   # Should be 1.70+
solana --version  # Should be 1.17+
anchor --version  # Should be 0.29+
```

---

## Part 1: Initial Setup

### Step 1: Create Project Structure

```bash
# Create root directory
mkdir flake-fund
cd flake-fund

# Initialize Git
git init
echo "node_modules/
target/
.anchor/
.env
.env.local
*.keypair.json
.DS_Store" > .gitignore
```

### Step 2: Setup Solana Wallet

```bash
# Generate a new keypair for development
solana-keygen new --outfile ~/.config/solana/devnet.json

# Set Solana CLI to use devnet
solana config set --url devnet

# Airdrop SOL for testing (may need to run multiple times)
solana airdrop 2

# Verify balance
solana balance
# Should show: 2 SOL
```

### Step 3: Get Devnet USDC

```bash
# Create a USDC token account
spl-token create-account EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Note your token account address (you'll see it in output)
# It will look like: 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi

# Request devnet USDC from faucet
# Visit: https://spl-token-faucet.com/?token-name=USDC-Dev
# Or use Circle's faucet if available
```

---

## Part 2: Smart Contract Setup

### Step 1: Initialize Anchor Project

```bash
# Create Anchor workspace
anchor init anchor --template multiple
cd anchor

# Verify it works
anchor build
```

### Step 2: Project Structure

Create the following file structure:

```bash
cd programs/flake-fund/src

# Create directories
mkdir state instructions

# Create files
touch state/mod.rs state/lobby.rs state/player_status.rs
touch instructions/mod.rs instructions/create_lobby.rs instructions/join_lobby.rs
touch instructions/verify_task.rs instructions/resolve_market.rs
touch constants.rs errors.rs
```

### Step 3: Update Anchor.toml

Edit `anchor/Anchor.toml`:

```toml
[toolchain]
anchor_version = "0.29.0"

[features]
seeds = true
skip-lint = false

[programs.localnet]
flake_fund = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[programs.devnet]
flake_fund = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/devnet.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### Step 4: Update Cargo.toml

Edit `programs/flake-fund/Cargo.toml`:

```toml
[package]
name = "flake-fund"
version = "0.1.0"
description = "Social accountability protocol with AI verification"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "flake_fund"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
```

### Step 5: Build and Deploy

```bash
# Build the program
anchor build

# Get your program ID
solana address -k target/deploy/flake_fund-keypair.json

# Update lib.rs with your program ID
# Replace the declare_id!() with your address

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show <YOUR_PROGRAM_ID>
```

---

## Part 3: Frontend Setup

### Step 1: Create Next.js App

```bash
# From root directory
npx create-next-app@14 app --typescript --tailwind --app

cd app

# Install Solana dependencies
npm install @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets \
            @solana/web3.js \
            @project-serum/anchor \
            @solana/spl-token
            
# Install shadcn
npx shadcn-ui@latest init

# Install additional dependencies
npm install lucide-react react-hot-toast
```

### Step 2: Setup Environment Variables

Create `app/.env.local`:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<YOUR_PROGRAM_ID>

# Token Configuration
NEXT_PUBLIC_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Agent Service (will setup later)
NEXT_PUBLIC_AGENT_URL=http://localhost:3001

# OpenAI (for API routes)
OPENAI_API_KEY=<YOUR_OPENAI_KEY>
```

### Step 3: Generate TypeScript Types

```bash
# From anchor directory
anchor idl parse -f programs/flake-fund/src/lib.rs -o ../app/src/lib/idl/flake_fund.json

# Verify the IDL was created
cat ../app/src/lib/idl/flake_fund.json
```

### Step 4: Start Development Server

```bash
cd app
npm run dev

# Visit http://localhost:3000
```

---

## Part 4: AI Agent Setup

### Step 1: Create Agent Project

```bash
# From root directory
mkdir agent
cd agent

# Initialize Node project
npm init -y

# Install dependencies
npm install express \
            @solana/web3.js \
            @project-serum/anchor \
            openai \
            dotenv \
            cors \
            body-parser \
            typescript \
            ts-node \
            @types/node \
            @types/express
```

### Step 2: Setup Agent Keypair

```bash
# Generate a new keypair for the agent
solana-keygen new --outfile agent-keypair.json

# Airdrop SOL to agent
solana airdrop 2 --keypair agent-keypair.json

# Get agent public key (you'll use this in smart contract)
solana address -k agent-keypair.json
```

### Step 3: Configure Environment

Create `agent/.env`:

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PROGRAM_ID=<YOUR_PROGRAM_ID>
AGENT_KEYPAIR_PATH=./agent-keypair.json

# OpenAI Configuration
OPENAI_API_KEY=<YOUR_OPENAI_KEY>

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Step 4: Create TypeScript Config

Create `agent/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 5: Add Scripts

Edit `agent/package.json`:

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## Part 5: First End-to-End Test

### Step 1: Create Test Lobby

```bash
# From anchor directory
anchor test

# This should:
# 1. Deploy program to local validator
# 2. Create a test lobby
# 3. Have test user join
# 4. Verify a task
# 5. Resolve market
```

### Step 2: Test Frontend

```bash
# Terminal 1: Run frontend
cd app
npm run dev

# Terminal 2: Run agent
cd agent
npm run dev

# In browser:
# 1. Visit http://localhost:3000
# 2. Connect Phantom wallet
# 3. Switch wallet to Devnet
# 4. Create a lobby
# 5. Join with USDC
```

### Step 3: Verify Everything Works

Checklist:
- [ ] Smart contract deployed to devnet
- [ ] Frontend connects to wallet
- [ ] Can create lobby
- [ ] Can join lobby (USDC transfers)
- [ ] Agent generates tasks
- [ ] Agent verifies images
- [ ] Can resolve and claim winnings

---

## Part 6: Common Issues & Solutions

### Issue: "Insufficient SOL balance"

```bash
# Airdrop more SOL
solana airdrop 2

# If faucet rate limit, use backup faucet
# Visit: https://faucet.solana.com
```

### Issue: "Program not found"

```bash
# Redeploy program
cd anchor
anchor build
anchor deploy

# Update program ID everywhere:
# 1. lib.rs (declare_id!)
# 2. Anchor.toml
# 3. app/.env.local
# 4. agent/.env
```

### Issue: "Transaction simulation failed"

```bash
# Check account discriminators match
anchor build

# Check program logs
solana logs <YOUR_PROGRAM_ID>
```

### Issue: "USDC token account not found"

```bash
# Create USDC token account
spl-token create-account EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Get devnet USDC
# Visit: https://spl-token-faucet.com/?token-name=USDC-Dev
```

### Issue: "OpenAI API rate limit"

```bash
# Check your OpenAI account quota
# Visit: https://platform.openai.com/account/usage

# Implement rate limiting in agent
# Use caching for repeated verifications
```

---

## Part 7: Development Workflow

### Daily Development

```bash
# Start local validator (optional, for faster testing)
solana-test-validator

# Watch smart contract changes
cd anchor
anchor build --watch

# Watch frontend changes
cd app
npm run dev

# Watch agent changes
cd agent
npm run dev
```

### Before Committing

```bash
# Run lints
cd anchor
cargo clippy

cd app
npm run lint

# Run tests
cd anchor
anchor test

cd app
npm test
```

### Deploy Updates

```bash
# 1. Update smart contract
cd anchor
anchor build
anchor deploy

# 2. Update frontend
cd app
npm run build
# Deploy to Vercel

# 3. Update agent
cd agent
npm run build
# Deploy to Railway/Render
```

---

## Part 8: Production Deployment

### Step 1: Mainnet Preparation

```bash
# Create mainnet keypair (SECURE THIS!)
solana-keygen new --outfile ~/.config/solana/mainnet.json

# BACKUP YOUR KEYPAIR
# Store in password manager + offline backup

# Switch to mainnet
solana config set --url mainnet-beta
```

### Step 2: Deploy to Mainnet

```bash
cd anchor

# Build for mainnet
anchor build

# Deploy (costs ~2-5 SOL)
anchor deploy --provider.cluster mainnet-beta

# Verify program
solana program show <PROGRAM_ID>
```

### Step 3: Frontend Deployment (Vercel)

```bash
cd app

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
# NEXT_PUBLIC_PROGRAM_ID=<mainnet_program_id>
```

### Step 4: Agent Deployment (Railway)

```bash
cd agent

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Deploy
railway up

# Set environment variables in Railway dashboard
```

---

## Part 9: Monitoring Setup

### Solana Program Monitoring

```bash
# Watch program logs
solana logs <PROGRAM_ID>

# Monitor transactions
# Visit: https://explorer.solana.com/address/<PROGRAM_ID>
```

### Frontend Monitoring

```bash
# Add Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx:
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Configure in sentry.client.config.ts
```

---

## Part 10: Cost Management

### Solana Costs

| Operation | Cost | Frequency |
|-----------|------|-----------|
| create_lobby | ~$0.0001 | Per lobby |
| join_lobby | ~$0.0002 | Per join |
| verify_task | ~$0.00005 | Per verification |
| resolve_market | ~$0.0002 | Per claim |

**Monthly estimate** (1000 users, 10 lobbies/day):
- Transactions: ~$50/month

### OpenAI Costs

| Operation | Cost | Frequency |
|-----------|------|-----------|
| Task generation | $0.01 | Per lobby/day |
| Image verification | $0.04 | Per verification |

**Monthly estimate** (1000 verifications/day):
- ~$1,200/month

### Infrastructure Costs

- Vercel Pro: $20/month
- Railway: $20-50/month
- RPC (QuickNode): $50/month

**Total**: ~$1,400/month at scale

---

## Part 11: Security Checklist

Before mainnet launch:

- [ ] Program audited by security firm
- [ ] Agent keypair in secure enclave (AWS KMS)
- [ ] Rate limiting on all API endpoints
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Program upgrade authority managed via multisig
- [ ] Admin actions require multiple signatures
- [ ] Monitoring and alerting setup
- [ ] Incident response plan documented
- [ ] Bug bounty program launched

---

## Part 12: Useful Commands Reference

### Solana CLI

```bash
# Check balance
solana balance

# Get address
solana address

# Transfer SOL
solana transfer <RECIPIENT> <AMOUNT>

# Check program
solana program show <PROGRAM_ID>

# Get transaction
solana confirm <SIGNATURE>
```

### Anchor CLI

```bash
# Build program
anchor build

# Test program
anchor test

# Deploy program
anchor deploy

# Generate IDL
anchor idl parse

# Upgrade program
anchor upgrade <PROGRAM_ID> target/deploy/program.so
```

### SPL Token CLI

```bash
# Create token account
spl-token create-account <MINT>

# Get balance
spl-token balance <MINT>

# Transfer tokens
spl-token transfer <MINT> <AMOUNT> <RECIPIENT>
```

---

## Part 13: Getting Help

### Resources

- [Solana Cookbook](https://solanacookbook.com)
- [Anchor Docs](https://www.anchor-lang.com)
- [Solana Stack Exchange](https://solana.stackexchange.com)
- [Anchor Discord](https://discord.gg/anchor)

### Debugging Tips

1. **Check program logs**:
   ```bash
   solana logs <PROGRAM_ID>
   ```

2. **Use anchor test with verbose**:
   ```bash
   anchor test -- --nocapture
   ```

3. **Inspect accounts**:
   ```bash
   solana account <ACCOUNT_ADDRESS>
   ```

4. **Check transaction details**:
   ```bash
   solana confirm -v <SIGNATURE>
   ```

---

## Success! 🎉

You now have a complete development environment for The Flake Fund.

**Next steps**:
1. Review [TASKS.md](./TASKS.md) for development tasks
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Start coding with Claude Code!

**Example Claude Code commands**:
```bash
# Start building the smart contract
claude code "Create the Lobby and PlayerStatus state structures in anchor/programs/flake-fund/src/state/"

# Build the frontend
claude code "Setup Next.js with Solana wallet adapter and create the lobby listing page"

# Create the AI agent
claude code "Build the image verification service using OpenAI Vision API"
```

Happy building! 🚀
