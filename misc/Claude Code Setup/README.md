# The Flake Fund - Project Structure

A social accountability protocol gamified by AI on Solana. Users stake USDC, complete daily AI-generated challenges, and winners split the flake tax.

## Architecture Overview

```
flake-fund/
├── anchor/                    # Solana smart contracts
│   ├── programs/
│   │   └── flake-fund/
│   │       ├── src/
│   │       │   ├── lib.rs
│   │       │   ├── state/
│   │       │   │   ├── mod.rs
│   │       │   │   ├── lobby.rs
│   │       │   │   └── player_status.rs
│   │       │   ├── instructions/
│   │       │   │   ├── mod.rs
│   │       │   │   ├── create_lobby.rs
│   │       │   │   ├── join_lobby.rs
│   │       │   │   ├── verify_task.rs
│   │       │   │   └── resolve_market.rs
│   │       │   ├── errors.rs
│   │       │   └── constants.rs
│   │       └── Cargo.toml
│   ├── tests/
│   │   └── flake-fund.ts
│   └── Anchor.toml
│
├── app/                       # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   ├── lobby/[id]/
│   │   │   └── api/
│   │   │       ├── generate-task/route.ts
│   │   │       └── verify-image/route.ts
│   │   ├── components/
│   │   │   ├── wallet/
│   │   │   │   └── WalletProvider.tsx
│   │   │   ├── lobby/
│   │   │   │   ├── LobbyCard.tsx
│   │   │   │   └── LobbyDetails.tsx
│   │   │   └── ui/           # shadcn components
│   │   ├── lib/
│   │   │   ├── solana/
│   │   │   │   ├── connection.ts
│   │   │   │   └── program.ts
│   │   │   ├── ai/
│   │   │   │   ├── task-generator.ts
│   │   │   │   └── image-verifier.ts
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── agent/                     # AI Agent service
│   ├── src/
│   │   ├── index.ts
│   │   ├── task-generator.ts
│   │   ├── image-verifier.ts
│   │   └── transaction-signer.ts
│   ├── package.json
│   └── .env.example
│
└── docs/
    ├── SETUP.md
    ├── TASKS.md
    └── ARCHITECTURE.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Solana CLI 1.17+
- Anchor 0.29+
- Phantom Wallet

### Installation

```bash
# Clone and install
git clone <repo>
cd flake-fund
npm install

# Setup Anchor
cd anchor
anchor build
anchor deploy --provider.cluster devnet

# Setup Frontend
cd ../app
npm install
cp .env.example .env.local
# Edit .env.local with your program ID and RPC endpoint
npm run dev

# Setup Agent
cd ../agent
npm install
cp .env.example .env
# Edit .env with OpenAI key and agent keypair
npm run dev
```

## Development Workflow for Claude Code

This project is structured for incremental development with Claude Code. Each module can be worked on independently.

### Module Dependencies

```
Smart Contract (anchor/) 
    ↓
Frontend (app/) + Agent (agent/)
    ↓
Integration Tests
```

### Recommended Development Order

1. **Phase 1: Smart Contract Core**
   - Task 1.1: Define state structures (lobby.rs, player_status.rs)
   - Task 1.2: Implement create_lobby instruction
   - Task 1.3: Implement join_lobby instruction
   - Task 1.4: Implement verify_task instruction
   - Task 1.5: Implement resolve_market instruction

2. **Phase 2: Frontend Scaffolding**
   - Task 2.1: Setup Next.js + Wallet connection
   - Task 2.2: Create lobby listing page
   - Task 2.3: Create lobby detail page
   - Task 2.4: Implement image upload UI

3. **Phase 3: AI Agent**
   - Task 3.1: Task generation service
   - Task 3.2: Image verification service
   - Task 3.3: Transaction signing service

4. **Phase 4: Integration**
   - Task 4.1: Connect frontend to smart contract
   - Task 4.2: Connect agent to smart contract
   - Task 4.3: End-to-end testing

## Environment Variables

### app/.env.local
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=<your_program_id>
NEXT_PUBLIC_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
OPENAI_API_KEY=<your_openai_key>
```

### agent/.env
```env
SOLANA_RPC_URL=https://api.devnet.solana.com
AGENT_KEYPAIR_PATH=./agent-keypair.json
PROGRAM_ID=<your_program_id>
OPENAI_API_KEY=<your_openai_key>
```

## Testing

```bash
# Test smart contract
cd anchor
anchor test

# Test frontend
cd app
npm run test

# Test agent
cd agent
npm run test
```

## Key Contracts & Constants

### Devnet Addresses
- USDC Mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- Charity Wallet: `<tbd>`

### Program Constants
```rust
pub const ENTRY_FEE: u64 = 10_000_000; // 10 USDC (6 decimals)
pub const CHARITY_PERCENTAGE: u8 = 50; // 50%
pub const MARKET_DURATION: i64 = 86400; // 24 hours
```

## Core Mechanics

### Parimutuel Formula

Given:
- T = Total Pot
- E = Entry Fee
- N_w = Winners Count
- N_l = Losers Count
- C = Charity Percentage (0.5)

Calculate:
1. Forfeited Funds: `F = N_l × E`
2. Charity Donation: `D = F × C`
3. Reward Pool: `R = F - D`
4. Payout per Winner: `P = E + (R / N_w)`

### Task Generation Themes

```typescript
const THEMES = {
  fitness: {
    prompts: [
      "Show gym equipment",
      "Show running shoes on pavement",
      "Show a healthy meal you prepared",
      "Show yourself doing a plank (timer visible)"
    ]
  },
  productivity: {
    prompts: [
      "Show your GitHub commits today",
      "Show a page from a book you're reading",
      "Show your deep work timer",
      "Show your completed to-do list"
    ]
  },
  wellness: {
    prompts: [
      "Show yourself outside (trees/sky visible)",
      "Show your meditation space",
      "Show your water intake tracker",
      "Show your sleep tracker stats"
    ]
  }
}
```

## Security Considerations

1. **Image Verification**: Uses OpenAI Vision API with specific prompts to detect context
2. **Timestamp Validation**: Tasks must be completed within market window
3. **Anti-Replay**: Each PlayerStatus is unique per lobby per day
4. **Signer Authority**: Only the agent keypair can call verify_task

## Deployment Checklist

- [ ] Deploy smart contract to devnet
- [ ] Fund agent wallet with SOL
- [ ] Deploy frontend to Vercel
- [ ] Deploy agent service to Railway/Render
- [ ] Configure charity wallet
- [ ] Test full user flow
- [ ] Deploy to mainnet

## Resources

- [Solana Cookbook](https://solanacookbook.com)
- [Anchor Docs](https://www.anchor-lang.com)
- [Solana AgentKit](https://github.com/sendaifun/solana-agent-kit)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)

## License

MIT
