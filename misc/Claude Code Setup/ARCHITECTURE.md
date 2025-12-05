# The Flake Fund - Architecture Documentation

## System Overview

The Flake Fund is a three-tier application:

```
┌─────────────────────────────────────────────────────────────┐
│                       User (Browser)                         │
│                 Phantom Wallet Connected                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Lobby UI   │  │  Image Upload│  │  Wallet SDK  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                   │                  │             │
│         └───────────────────┼──────────────────┘             │
│                             │                                │
│                    API Routes (Internal)                     │
│         ┌──────────────────┴──────────────────┐             │
│         │                                      │             │
└─────────┼──────────────────────────────────────┼─────────────┘
          │                                      │
          │ RPC                                  │ HTTP
          ▼                                      ▼
┌──────────────────────┐            ┌────────────────────────┐
│   Solana Network     │            │   AI Agent Service     │
│                      │            │                        │
│  ┌────────────────┐  │            │  ┌──────────────────┐ │
│  │ Flake Fund     │  │            │  │ Task Generator   │ │
│  │ Program (Rust) │  │            │  └──────────────────┘ │
│  └────────────────┘  │            │  ┌──────────────────┐ │
│  ┌────────────────┐  │            │  │ Image Verifier   │ │
│  │ USDC Token     │  │            │  └──────────────────┘ │
│  │ Program        │  │            │  ┌──────────────────┐ │
│  └────────────────┘  │            │  │ TX Signer        │ │
│                      │            │  └──────────────────┘ │
└──────────────────────┘            └────────────────────────┘
                                              │
                                              │ OpenAI API
                                              ▼
                                    ┌──────────────────┐
                                    │   OpenAI GPT-4   │
                                    │   Vision API     │
                                    └──────────────────┘
```

## Core Components

### 1. Smart Contract (Solana/Anchor)

**Location**: `anchor/programs/flake-fund/`

**Responsibilities**:
- Escrow USDC deposits
- Track player verification status
- Calculate and distribute payouts using parimutuel formula
- Enforce market timing rules

**Key Design Decisions**:

#### PDA Architecture
```
Lobby PDA:
seeds = [b"lobby", authority.key(), task_description.bytes()]

PlayerStatus PDA:
seeds = [b"player_status", lobby.key(), player.key()]

Vault PDA:
seeds = [b"vault", lobby.key()]
```

This design ensures:
- Unique lobbies per creator + task
- One player status per lobby per player
- One vault per lobby for USDC storage

#### State Management
The contract uses two account types:
1. **Lobby**: Global state (one per lobby)
2. **PlayerStatus**: Per-player state (many per lobby)

This separation allows:
- Parallel player operations (no contention)
- Easy querying of individual player status
- Efficient state updates

#### Token Flow
```
Player Wallet (USDC)
    │
    │ join_lobby()
    ▼
Vault PDA (USDC)
    │
    │ resolve_market()
    ├─────────────┬─────────────┐
    ▼             ▼             ▼
Winner 1     Winner 2      Charity
```

---

### 2. Frontend (Next.js 14)

**Location**: `app/`

**Technology Choices**:
- **Next.js 14**: App router for server components
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built accessible components
- **@solana/wallet-adapter**: Wallet connection
- **@project-serum/anchor**: Smart contract interaction

**Page Structure**:
```
/ (homepage)
    └─ Landing page with CTA
/dashboard
    └─ List all active lobbies
/lobby/[id]
    └─ Lobby detail, join, and task submission
/history
    └─ Past lobby results and earnings
```

**State Management Strategy**:
```typescript
// Use React Context for global state
WalletContext: Connected wallet info
ProgramContext: Anchor program instance
UserContext: User profile and stats

// Use local state for UI
LobbyDetailPage: Current lobby data
ImageUpload: Preview and file state
```

**Key Frontend Patterns**:

#### Program Integration
```typescript
// lib/solana/program.ts
export class FlakeFundProgram {
  async joinLobby(lobbyPubkey: PublicKey) {
    // 1. Derive PDAs
    const [playerStatus] = await PublicKey.findProgramAddress(
      [Buffer.from("player_status"), lobbyPubkey.toBuffer(), wallet.publicKey.toBuffer()],
      programId
    );
    
    // 2. Get token accounts
    const playerTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      wallet.publicKey
    );
    
    // 3. Call instruction
    await program.methods
      .joinLobby()
      .accounts({
        lobby: lobbyPubkey,
        playerStatus,
        player: wallet.publicKey,
        playerToken: playerTokenAccount,
        // ...
      })
      .rpc();
  }
}
```

#### Error Handling
```typescript
try {
  await program.methods.joinLobby().rpc();
  toast.success("Successfully joined lobby!");
} catch (error: any) {
  if (error.message.includes("MarketClosed")) {
    toast.error("This lobby has already closed");
  } else if (error.message.includes("InsufficientFunds")) {
    toast.error("Insufficient USDC balance");
  } else {
    toast.error("Transaction failed");
  }
}
```

---

### 3. AI Agent Service

**Location**: `agent/`

**Purpose**: Bridge between Web2 AI and Web3 verification

**Architecture**:
```
Express Server
    │
    ├─ POST /api/generate-task
    │      └─ TaskGenerator → OpenAI GPT-4
    │
    └─ POST /api/verify
           ├─ ImageVerifier → OpenAI Vision API
           └─ TransactionSigner → Solana RPC
```

**Key Components**:

#### Task Generator
```typescript
class TaskGenerator {
  async generateDailyTask(theme: string): Promise<string> {
    // 1. Select base prompt from theme
    const basePrompt = THEME_PROMPTS[theme][random()];
    
    // 2. Add unique twist via GPT-4
    const enhanced = await this.openai.completions.create({
      prompt: `Make this task unique: ${basePrompt}`,
      max_tokens: 50
    });
    
    // 3. Return specific, verifiable task
    return enhanced.choices[0].text;
  }
}
```

**Why this matters**: 
- Prevents users from using old photos
- Keeps the game fresh
- Forces actual task completion

#### Image Verifier
```typescript
class ImageVerifier {
  async verifyImage(imageBase64: string, task: string): Promise<boolean> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `Does this image show: ${task}?` },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
        ]
      }]
    });
    
    // Parse confidence score
    const result = JSON.parse(response.choices[0].message.content);
    return result.confidence > 80;
  }
}
```

**Security Model**:
```
┌─────────────────────────────────────────────────┐
│ Agent Service (Trusted)                         │
│                                                 │
│  ┌─────────────────────────────────┐           │
│  │ Private Keypair                 │           │
│  │ (stored in .env)                │           │
│  │                                 │           │
│  │ Can call verify_task()          │           │
│  └─────────────────────────────────┘           │
│                                                 │
│  Only this keypair can mark players verified   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Users (Untrusted)                               │
│                                                 │
│  ✅ Can: create_lobby, join_lobby, resolve     │
│  ❌ Cannot: verify_task (requires agent sig)   │
└─────────────────────────────────────────────────┘
```

**Trade-offs**:
- **Centralized**: Agent service is a single point of trust
- **MVP-appropriate**: Good for hackathon/prototype
- **Production path**: Migrate to Switchboard oracle or MPC network

---

## Data Flow Examples

### User Journey: Join Lobby

```
1. User clicks "Join Lobby"
   └─> Frontend validates wallet connection

2. Frontend calls joinLobby()
   └─> Derives PDAs (PlayerStatus, Vault)
   └─> Gets user's USDC token account
   └─> Builds transaction

3. User approves in Phantom
   └─> Transaction sent to Solana

4. Smart contract executes
   ├─> Transfers USDC from user to vault
   ├─> Creates PlayerStatus account
   └─> Updates Lobby total_pot

5. Frontend polls for confirmation
   └─> Shows success toast
   └─> Redirects to lobby detail page
```

### User Journey: Complete Task

```
1. Daily reset (8:00 AM)
   └─> Frontend calls /api/generate-task
       └─> Agent generates unique task via GPT-4
       └─> Returns task string

2. User sees task in UI
   └─> "Show a treadmill with > 1 mile"

3. User uploads photo
   ├─> Frontend compresses image
   ├─> Converts to base64
   └─> Sends to /api/verify

4. Agent Service processes
   ├─> ImageVerifier checks photo via Vision API
   ├─> If valid: TransactionSigner calls verify_task()
   └─> Returns {verified: true, signature: "..."}

5. Smart contract updates
   ├─> Sets player_status.is_verified = true
   └─> Increments lobby.verified_count

6. Frontend shows verification badge
   └─> "✅ Task Completed!"
```

### Market Resolution

```
1. Market close time reached (8:00 AM next day)

2. User clicks "Claim Winnings"
   └─> Frontend calls resolveMarket()

3. Smart contract calculates
   ├─> Winners: 8/10 players
   ├─> Losers: 2/10 players
   ├─> Forfeited: 2 × 10 USDC = 20 USDC
   ├─> To charity: 20 × 50% = 10 USDC
   ├─> Reward pool: 20 × 50% = 10 USDC
   └─> Per winner: 10 USDC + (10/8) = 11.25 USDC

4. Smart contract transfers
   ├─> 10 USDC → Charity wallet
   └─> 11.25 USDC → User wallet

5. PlayerStatus marked as claimed
   └─> Prevents double-claiming
```

---

## Key Technical Decisions

### Why Solana over Ethereum?

| Aspect | Solana | Ethereum L2 |
|--------|--------|-------------|
| **Transaction Speed** | ~400ms | ~2-10s |
| **Cost** | $0.00025 | $0.50-$2.00 |
| **Finality** | 13 seconds | 10-30 min |
| **User Experience** | Fast, cheap | Slower, pricier |

**Decision**: Solana's speed/cost is critical for daily micro-transactions.

### Why USDC over Native SOL?

- **Stability**: Entry fees don't fluctuate
- **Familiarity**: Users understand dollar amounts
- **Charity**: Easier to send stable value to charities
- **Accounting**: Simpler payout calculations

### Why Centralized Agent (for now)?

**Pros**:
- Fast to build (critical for hackathon)
- Easy to debug
- Flexible prompt engineering
- Can use latest OpenAI models

**Cons**:
- Single point of failure
- Requires trust
- Not fully decentralized

**Future Migration Path**:
```
MVP (Hackathon)
    └─> Centralized Agent
        
v2 (Post-hackathon)
    └─> Switchboard Oracle
        └─> Multiple nodes verify images
        
v3 (Production)
    └─> MPC Network (Lit Protocol)
        └─> Distributed signing
```

---

## Security Considerations

### Attack Vectors & Mitigations

#### 1. Photo Reuse Attack
**Attack**: User uploads old photo from camera roll
**Mitigation**: Daily task has unique requirement (e.g., "hold up 2 fingers")
**Code**:
```typescript
const task = `Do a plank. Show your hands on floor with timer showing ${randomTime} seconds`;
```

#### 2. Sybil Attack
**Attack**: User creates multiple accounts to game payouts
**Mitigation**: Entry fee makes this expensive; KYC possible for v2
**Status**: Accepted risk for MVP

#### 3. Agent Compromise
**Attack**: Attacker steals agent private key
**Impact**: Could verify all players fraudulently
**Mitigation**: 
- Store key in secure enclave (AWS KMS)
- Rate limiting on verify endpoint
- Multi-sig for production

#### 4. Market Manipulation
**Attack**: Users collude to all fail and donate to chosen charity
**Mitigation**: This is actually acceptable behavior (charity still wins)
**Status**: Feature, not bug

#### 5. Reentrancy
**Attack**: Malicious contract calls resolve_market recursively
**Mitigation**: Anchor's account structure prevents this
**Code**:
```rust
require!(!player_status.has_claimed, FlakeFundError::AlreadyClaimed);
player_status.has_claimed = true; // Set BEFORE transfer
```

---

## Testing Strategy

### Unit Tests (Rust)
```bash
cd anchor
anchor test
```

Tests:
- PDA derivation
- Token transfers
- Math calculations
- Error handling

### Integration Tests (TypeScript)
```bash
cd anchor/tests
ts-node flake-fund.ts
```

Tests:
- Full user flow
- Multiple players
- Edge cases (late join, zero winners, etc.)

### Frontend Tests (Jest)
```bash
cd app
npm test
```

Tests:
- Component rendering
- Wallet connection
- Program integration

### E2E Tests (Playwright)
```bash
cd tests
npx playwright test
```

Tests:
- Browser wallet interaction
- Complete user journey
- Error states

---

## Deployment Architecture

### Devnet (Testing)
```
Solana Devnet
    ├─> Program ID: [generated]
    └─> USDC Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

Frontend (Vercel)
    └─> Environment: NEXT_PUBLIC_SOLANA_NETWORK=devnet

Agent (Railway)
    └─> Environment: SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Mainnet (Production)
```
Solana Mainnet
    ├─> Program ID: [deployed via multi-sig]
    └─> USDC Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

Frontend (Vercel Pro)
    ├─> CDN: Global edge network
    └─> RPC: QuickNode/Helius premium

Agent (AWS ECS)
    ├─> Auto-scaling: 2-10 containers
    ├─> Load balancer: Application LB
    └─> Secrets: AWS Secrets Manager
```

---

## Performance Optimizations

### Smart Contract
- Use PDAs to avoid rent (permanent accounts)
- Minimize compute units with efficient math
- Batch operations where possible

### Frontend
- Server-side rendering for lobby list
- Incremental static regeneration (ISR)
- Image optimization with Next.js Image
- Lazy load components

### Agent Service
- Redis cache for recent verifications
- Rate limiting per user/IP
- Async processing with queue (Bull/Bee)

---

## Monitoring & Observability

### Metrics to Track

**On-Chain**:
- Total value locked (TVL)
- Active lobbies count
- Verification rate
- Average payout

**Off-Chain**:
- API latency (p50, p95, p99)
- OpenAI API errors
- Transaction success rate
- User retention

**Tooling**:
- Solana Beach: On-chain explorer
- Vercel Analytics: Frontend performance
- DataDog/Sentry: Error tracking
- PostHog: Product analytics

---

## Future Enhancements

### Phase 2 Features
- [ ] Social feed of completions
- [ ] Leaderboards
- [ ] Lobby chat
- [ ] Custom charity selection
- [ ] Recurring lobbies (weekly, monthly)

### Phase 3 Features
- [ ] Mobile app (React Native)
- [ ] NFT badges for streaks
- [ ] Sponsored lobbies (brands pay entry fee)
- [ ] DAO governance for platform decisions

---

## Cost Analysis

### Per Transaction Costs

**Solana Transactions**:
- create_lobby: ~0.001 SOL (~$0.0001)
- join_lobby: ~0.001 SOL + SPL token transfer
- verify_task: ~0.0005 SOL
- resolve_market: ~0.002 SOL

**AI API Costs**:
- Task generation: $0.01 per lobby per day
- Image verification: $0.04 per verification

**Monthly Operating Cost** (1000 users, 10 lobbies/day):
- Solana: ~$50
- OpenAI: ~$1,200
- Infrastructure: ~$200
- **Total**: ~$1,450/month

**Revenue Model**:
- Take 2.5% platform fee from pots
- At $100k monthly volume → $2,500 revenue
- **Net**: ~$1,000/month profit at scale

---

## Conclusion

The Flake Fund architecture balances:
- **Speed**: Solana for fast, cheap transactions
- **Simplicity**: Centralized agent for MVP speed
- **Security**: Anchor's safety guarantees
- **UX**: Familiar wallet + web interface

This design is optimized for hackathon demonstration while maintaining a clear path to production scaling.
