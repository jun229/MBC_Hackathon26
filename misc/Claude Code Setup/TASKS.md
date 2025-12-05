# Development Tasks - The Flake Fund

This document breaks down the project into discrete, actionable tasks perfect for Claude Code workflows.

## Legend
- 🟢 Independent (no dependencies)
- 🟡 Requires previous task
- 🔴 Requires multiple dependencies
- ⚡ Critical path item

## Phase 1: Smart Contract Foundation

### Task 1.1: Project Setup 🟢
**File**: `anchor/programs/flake-fund/Cargo.toml`
**Description**: Initialize Anchor project with dependencies
**Checklist**:
- [ ] Create anchor project structure
- [ ] Add required dependencies (anchor-lang, anchor-spl)
- [ ] Configure workspace
- [ ] Create initial lib.rs skeleton

**Command for Claude Code**:
```bash
claude code "Initialize Anchor project with workspace structure, add anchor-lang 0.29 and anchor-spl dependencies"
```

---

### Task 1.2: Define State Structures 🟢 ⚡
**Files**: 
- `anchor/programs/flake-fund/src/state/lobby.rs`
- `anchor/programs/flake-fund/src/state/player_status.rs`
- `anchor/programs/flake-fund/src/state/mod.rs`

**Description**: Implement the core data structures

**lobby.rs**:
```rust
use anchor_lang::prelude::*;

#[account]
pub struct Lobby {
    pub authority: Pubkey,           // 32 bytes
    pub task_description: String,    // 4 + 100 bytes
    pub entry_fee: u64,              // 8 bytes
    pub charity_wallet: Pubkey,      // 32 bytes
    pub market_close: i64,           // 8 bytes
    pub total_pot: u64,              // 8 bytes
    pub verified_count: u8,          // 1 byte
    pub total_players: u8,           // 1 byte
    pub is_resolved: bool,           // 1 byte
    pub bump: u8,                    // 1 byte
}

impl Lobby {
    pub const LEN: usize = 8 + 32 + 4 + 100 + 8 + 32 + 8 + 8 + 1 + 1 + 1 + 1;
    
    pub const SEED_PREFIX: &'static [u8] = b"lobby";
}
```

**player_status.rs**:
```rust
use anchor_lang::prelude::*;

#[account]
pub struct PlayerStatus {
    pub player: Pubkey,              // 32 bytes
    pub lobby: Pubkey,               // 32 bytes
    pub has_deposited: bool,         // 1 byte
    pub is_verified: bool,           // 1 byte
    pub has_claimed: bool,           // 1 byte
    pub timestamp: i64,              // 8 bytes
    pub bump: u8,                    // 1 byte
}

impl PlayerStatus {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 1 + 1 + 8 + 1;
    
    pub const SEED_PREFIX: &'static [u8] = b"player_status";
}
```

**Command for Claude Code**:
```bash
claude code "Create state structures in anchor/programs/flake-fund/src/state/ following the Lobby and PlayerStatus specs with proper space calculation"
```

---

### Task 1.3: Create Constants & Errors 🟢
**Files**: 
- `anchor/programs/flake-fund/src/constants.rs`
- `anchor/programs/flake-fund/src/errors.rs`

**constants.rs**:
```rust
pub const ENTRY_FEE: u64 = 10_000_000; // 10 USDC
pub const CHARITY_PERCENTAGE: u8 = 50;
pub const MARKET_DURATION: i64 = 86400; // 24 hours
pub const MAX_TASK_DESCRIPTION_LEN: usize = 100;
```

**errors.rs**:
```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum FlakeFundError {
    #[msg("Market has already closed")]
    MarketClosed,
    #[msg("Market is still open")]
    MarketStillOpen,
    #[msg("Player already deposited")]
    AlreadyDeposited,
    #[msg("Player not verified")]
    NotVerified,
    #[msg("Already claimed rewards")]
    AlreadyClaimed,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid charity percentage")]
    InvalidCharityPercentage,
    #[msg("Unauthorized")]
    Unauthorized,
}
```

**Command for Claude Code**:
```bash
claude code "Create constants.rs and errors.rs files with FlakeFundError enum and program constants"
```

---

### Task 1.4: Implement create_lobby Instruction 🟡 ⚡
**File**: `anchor/programs/flake-fund/src/instructions/create_lobby.rs`

**Description**: Allow users to create new accountability lobbies

**Context Accounts**:
```rust
#[derive(Accounts)]
#[instruction(task_description: String)]
pub struct CreateLobby<'info> {
    #[account(
        init,
        payer = authority,
        space = Lobby::LEN,
        seeds = [Lobby::SEED_PREFIX, authority.key().as_ref(), task_description.as_bytes()],
        bump
    )]
    pub lobby: Account<'info, Lobby>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the charity wallet address
    pub charity_wallet: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}
```

**Handler Logic**:
```rust
pub fn handler(
    ctx: Context<CreateLobby>,
    task_description: String,
    entry_fee: u64,
) -> Result<()> {
    let lobby = &mut ctx.accounts.lobby;
    let clock = Clock::get()?;
    
    require!(
        task_description.len() <= MAX_TASK_DESCRIPTION_LEN,
        FlakeFundError::InvalidTaskDescription
    );
    
    lobby.authority = ctx.accounts.authority.key();
    lobby.task_description = task_description;
    lobby.entry_fee = entry_fee;
    lobby.charity_wallet = ctx.accounts.charity_wallet.key();
    lobby.market_close = clock.unix_timestamp + MARKET_DURATION;
    lobby.total_pot = 0;
    lobby.verified_count = 0;
    lobby.total_players = 0;
    lobby.is_resolved = false;
    lobby.bump = ctx.bumps.lobby;
    
    Ok(())
}
```

**Command for Claude Code**:
```bash
claude code "Implement create_lobby instruction in anchor/programs/flake-fund/src/instructions/ with PDA derivation and initialization logic"
```

---

### Task 1.5: Implement join_lobby Instruction 🟡 ⚡
**File**: `anchor/programs/flake-fund/src/instructions/join_lobby.rs`

**Description**: Transfer USDC from user to program vault

**Context Accounts**:
```rust
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct JoinLobby<'info> {
    #[account(
        mut,
        seeds = [Lobby::SEED_PREFIX, lobby.authority.as_ref(), lobby.task_description.as_bytes()],
        bump = lobby.bump
    )]
    pub lobby: Account<'info, Lobby>,
    
    #[account(
        init,
        payer = player,
        space = PlayerStatus::LEN,
        seeds = [PlayerStatus::SEED_PREFIX, lobby.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub player_status: Account<'info, PlayerStatus>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        mut,
        constraint = player_token.owner == player.key(),
        constraint = player_token.mint == usdc_mint.key()
    )]
    pub player_token: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"vault", lobby.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,
    
    /// CHECK: USDC mint address
    pub usdc_mint: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

**Handler Logic**:
```rust
pub fn handler(ctx: Context<JoinLobby>) -> Result<()> {
    let lobby = &mut ctx.accounts.lobby;
    let player_status = &mut ctx.accounts.player_status;
    let clock = Clock::get()?;
    
    require!(
        clock.unix_timestamp < lobby.market_close,
        FlakeFundError::MarketClosed
    );
    
    // Transfer USDC from player to vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.player_token.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.player.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::transfer(cpi_ctx, lobby.entry_fee)?;
    
    // Update state
    player_status.player = ctx.accounts.player.key();
    player_status.lobby = lobby.key();
    player_status.has_deposited = true;
    player_status.is_verified = false;
    player_status.has_claimed = false;
    player_status.timestamp = clock.unix_timestamp;
    player_status.bump = ctx.bumps.player_status;
    
    lobby.total_pot += lobby.entry_fee;
    lobby.total_players += 1;
    
    Ok(())
}
```

**Command for Claude Code**:
```bash
claude code "Implement join_lobby instruction with USDC token transfer from player to vault PDA"
```

---

### Task 1.6: Implement verify_task Instruction 🟡 ⚡
**File**: `anchor/programs/flake-fund/src/instructions/verify_task.rs`

**Description**: AI agent marks a player as verified

**Context Accounts**:
```rust
#[derive(Accounts)]
pub struct VerifyTask<'info> {
    #[account(
        seeds = [Lobby::SEED_PREFIX, lobby.authority.as_ref(), lobby.task_description.as_bytes()],
        bump = lobby.bump
    )]
    pub lobby: Account<'info, Lobby>,
    
    #[account(
        mut,
        seeds = [PlayerStatus::SEED_PREFIX, lobby.key().as_ref(), player.key().as_ref()],
        bump = player_status.bump
    )]
    pub player_status: Account<'info, PlayerStatus>,
    
    /// CHECK: The player being verified
    pub player: UncheckedAccount<'info>,
    
    #[account(mut, constraint = agent.key() == lobby.authority @ FlakeFundError::Unauthorized)]
    pub agent: Signer<'info>,
}
```

**Handler Logic**:
```rust
pub fn handler(ctx: Context<VerifyTask>) -> Result<()> {
    let lobby = &mut ctx.accounts.lobby;
    let player_status = &mut ctx.accounts.player_status;
    let clock = Clock::get()?;
    
    require!(
        clock.unix_timestamp < lobby.market_close,
        FlakeFundError::MarketClosed
    );
    
    require!(
        player_status.has_deposited,
        FlakeFundError::NotDeposited
    );
    
    require!(
        !player_status.is_verified,
        FlakeFundError::AlreadyVerified
    );
    
    player_status.is_verified = true;
    lobby.verified_count += 1;
    
    Ok(())
}
```

**Command for Claude Code**:
```bash
claude code "Implement verify_task instruction that allows authorized agent to mark player as verified"
```

---

### Task 1.7: Implement resolve_market Instruction 🔴 ⚡
**File**: `anchor/programs/flake-fund/src/instructions/resolve_market.rs`

**Description**: Calculate payouts and distribute funds

**Context Accounts**:
```rust
#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(
        mut,
        seeds = [Lobby::SEED_PREFIX, lobby.authority.as_ref(), lobby.task_description.as_bytes()],
        bump = lobby.bump
    )]
    pub lobby: Account<'info, Lobby>,
    
    #[account(
        mut,
        seeds = [PlayerStatus::SEED_PREFIX, lobby.key().as_ref(), player.key().as_ref()],
        bump = player_status.bump
    )]
    pub player_status: Account<'info, PlayerStatus>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"vault", lobby.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub player_token: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub charity_token: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}
```

**Handler Logic (Parimutuel Math)**:
```rust
pub fn handler(ctx: Context<ResolveMarket>) -> Result<()> {
    let lobby = &ctx.accounts.lobby;
    let player_status = &mut ctx.accounts.player_status;
    let clock = Clock::get()?;
    
    require!(
        clock.unix_timestamp >= lobby.market_close,
        FlakeFundError::MarketStillOpen
    );
    
    require!(
        player_status.is_verified,
        FlakeFundError::NotVerified
    );
    
    require!(
        !player_status.has_claimed,
        FlakeFundError::AlreadyClaimed
    );
    
    // Calculate payouts using parimutuel formula
    let total_players = lobby.total_players as u64;
    let verified_players = lobby.verified_count as u64;
    let failed_players = total_players - verified_players;
    
    let forfeited_funds = failed_players * lobby.entry_fee;
    let charity_amount = (forfeited_funds * CHARITY_PERCENTAGE as u64) / 100;
    let reward_pool = forfeited_funds - charity_amount;
    
    let payout_per_winner = if verified_players > 0 {
        lobby.entry_fee + (reward_pool / verified_players)
    } else {
        0
    };
    
    // Transfer to charity
    if charity_amount > 0 {
        let seeds = &[
            b"vault",
            lobby.key().as_ref(),
            &[ctx.bumps.vault],
        ];
        let signer_seeds = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.charity_token.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        
        token::transfer(cpi_ctx, charity_amount)?;
    }
    
    // Transfer payout to winner
    if payout_per_winner > 0 {
        let seeds = &[
            b"vault",
            lobby.key().as_ref(),
            &[ctx.bumps.vault],
        ];
        let signer_seeds = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.player_token.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        
        token::transfer(cpi_ctx, payout_per_winner)?;
    }
    
    player_status.has_claimed = true;
    
    Ok(())
}
```

**Command for Claude Code**:
```bash
claude code "Implement resolve_market instruction with parimutuel payout calculation, charity distribution, and winner payouts using PDA signer seeds"
```

---

### Task 1.8: Wire Up lib.rs 🔴
**File**: `anchor/programs/flake-fund/src/lib.rs`

**Description**: Export all instructions and create program entrypoint

```rust
use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("YourProgramIDHere");

#[program]
pub mod flake_fund {
    use super::*;

    pub fn create_lobby(
        ctx: Context<CreateLobby>,
        task_description: String,
        entry_fee: u64,
    ) -> Result<()> {
        instructions::create_lobby::handler(ctx, task_description, entry_fee)
    }

    pub fn join_lobby(ctx: Context<JoinLobby>) -> Result<()> {
        instructions::join_lobby::handler(ctx)
    }

    pub fn verify_task(ctx: Context<VerifyTask>) -> Result<()> {
        instructions::verify_task::handler(ctx)
    }

    pub fn resolve_market(ctx: Context<ResolveMarket>) -> Result<()> {
        instructions::resolve_market::handler(ctx)
    }
}
```

**Command for Claude Code**:
```bash
claude code "Wire up all instructions in lib.rs and create program entrypoint with proper imports"
```

---

### Task 1.9: Write Integration Tests 🔴
**File**: `anchor/tests/flake-fund.ts`

**Description**: Full end-to-end test suite

**Test Cases**:
1. Create lobby successfully
2. Join lobby with USDC transfer
3. Verify task as agent
4. Resolve market and claim winnings
5. Test charity distribution
6. Test edge cases (market closed, already claimed, etc.)

**Command for Claude Code**:
```bash
claude code "Create comprehensive test suite in anchor/tests/flake-fund.ts covering all instructions and edge cases"
```

---

## Phase 2: Frontend Development

### Task 2.1: Next.js Setup 🟢
**Files**: 
- `app/package.json`
- `app/src/app/layout.tsx`
- `app/src/app/page.tsx`

**Description**: Initialize Next.js 14 with TypeScript, Tailwind, shadcn

**Dependencies**:
```json
{
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-wallets": "^0.19.26",
  "@solana/web3.js": "^1.87.6",
  "@project-serum/anchor": "^0.29.0",
  "next": "14.0.4",
  "react": "^18.2.0",
  "tailwindcss": "^3.4.0"
}
```

**Command for Claude Code**:
```bash
claude code "Initialize Next.js 14 app with TypeScript, Tailwind CSS, and Solana wallet adapter dependencies"
```

---

### Task 2.2: Wallet Provider Setup 🟡
**File**: `app/src/components/wallet/WalletProvider.tsx`

**Description**: Setup Solana wallet connection with Phantom

```typescript
'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const endpoint = useMemo(() => clusterApiUrl(network as any), [network]);
  
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

**Command for Claude Code**:
```bash
claude code "Create Solana wallet provider component with Phantom wallet support in app/src/components/wallet/"
```

---

### Task 2.3: Program Integration Layer 🟡 ⚡
**File**: `app/src/lib/solana/program.ts`

**Description**: Create TypeScript SDK for interacting with smart contract

```typescript
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from './idl/flake_fund.json';

export class FlakeFundProgram {
  constructor(
    public program: Program,
    public provider: AnchorProvider
  ) {}

  static initialize(connection: Connection, wallet: any): FlakeFundProgram {
    const provider = new AnchorProvider(connection, wallet, {});
    const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
    const program = new Program(idl as any, programId, provider);
    
    return new FlakeFundProgram(program, provider);
  }

  async createLobby(taskDescription: string, entryFee: BN, charityWallet: PublicKey) {
    // Implementation
  }

  async joinLobby(lobbyAddress: PublicKey) {
    // Implementation
  }

  async getLobbyData(lobbyAddress: PublicKey) {
    return await this.program.account.lobby.fetch(lobbyAddress);
  }

  async getPlayerStatus(lobbyAddress: PublicKey, playerAddress: PublicKey) {
    // Implementation
  }
}
```

**Command for Claude Code**:
```bash
claude code "Create FlakeFundProgram SDK class in app/src/lib/solana/program.ts with methods for all smart contract interactions"
```

---

### Task 2.4: Lobby Listing UI 🟡
**Files**:
- `app/src/app/dashboard/page.tsx`
- `app/src/components/lobby/LobbyCard.tsx`

**Description**: Display all active lobbies with stats

**Command for Claude Code**:
```bash
claude code "Create dashboard page with lobby listing grid using shadcn cards, showing lobby theme, entry fee, participants, and time remaining"
```

---

### Task 2.5: Lobby Detail Page 🟡
**File**: `app/src/app/lobby/[id]/page.tsx`

**Description**: Full lobby view with join button and task details

**Features**:
- Lobby stats (pot size, participants, etc.)
- Current daily task
- Image upload for verification
- Member list
- Countdown timer

**Command for Claude Code**:
```bash
claude code "Create dynamic lobby detail page at app/src/app/lobby/[id]/page.tsx with task display, image upload, and join functionality"
```

---

### Task 2.6: Image Upload Component 🟡
**File**: `app/src/components/ImageUpload.tsx`

**Description**: Drag-and-drop image upload with preview

```typescript
export function ImageUpload({ onUpload }: { onUpload: (file: File) => void }) {
  // Drag and drop
  // File input
  // Preview
  // Submit to API route
}
```

**Command for Claude Code**:
```bash
claude code "Create ImageUpload component with drag-and-drop, preview, and file validation in app/src/components/"
```

---

## Phase 3: AI Agent Service

### Task 3.1: Task Generator Service 🟢 ⚡
**File**: `agent/src/task-generator.ts`

**Description**: LLM-powered task generation based on theme

```typescript
import OpenAI from 'openai';

const THEME_PROMPTS = {
  fitness: [
    "Show gym equipment you used today",
    "Show running shoes on pavement",
    "Show a healthy meal you prepared",
  ],
  productivity: [
    "Show your GitHub commits",
    "Show a book page you read",
  ],
};

export class TaskGenerator {
  constructor(private openai: OpenAI) {}

  async generateDailyTask(theme: string): Promise<string> {
    const prompts = THEME_PROMPTS[theme as keyof typeof THEME_PROMPTS];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    // Optionally use GPT to add unique twist
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a creative accountability coach. Add a unique, specific requirement to this task prompt.'
        },
        {
          role: 'user',
          content: randomPrompt
        }
      ],
      max_tokens: 100,
    });
    
    return response.choices[0].message.content || randomPrompt;
  }
}
```

**Command for Claude Code**:
```bash
claude code "Create task generator service in agent/src/task-generator.ts with theme-based prompt selection and GPT enhancement"
```

---

### Task 3.2: Image Verification Service 🟢 ⚡
**File**: `agent/src/image-verifier.ts`

**Description**: OpenAI Vision API for photo verification

```typescript
import OpenAI from 'openai';

export class ImageVerifier {
  constructor(private openai: OpenAI) {}

  async verifyImage(imageBase64: string, taskDescription: string): Promise<boolean> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image. Does it match this requirement: "${taskDescription}"? 
              
              Return ONLY a JSON object with this exact format:
              {"verified": true/false, "confidence": 0-100, "reason": "brief explanation"}
              
              Be strict but fair. Look for evidence of genuine completion.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"verified": false}');
    return result.verified && result.confidence >= 80;
  }
}
```

**Command for Claude Code**:
```bash
claude code "Create image verification service using OpenAI Vision API in agent/src/image-verifier.ts"
```

---

### Task 3.3: Transaction Signer Service 🟡 ⚡
**File**: `agent/src/transaction-signer.ts`

**Description**: Sign verify_task transactions on behalf of agent

```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import fs from 'fs';

export class TransactionSigner {
  private wallet: Wallet;
  private program: Program;

  constructor(keypairPath: string, connection: Connection, programId: PublicKey) {
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
    this.wallet = new Wallet(keypair);
    
    const provider = new AnchorProvider(connection, this.wallet, {});
    this.program = new Program(idl, programId, provider);
  }

  async verifyPlayer(lobbyAddress: PublicKey, playerAddress: PublicKey): Promise<string> {
    const tx = await this.program.methods
      .verifyTask()
      .accounts({
        lobby: lobbyAddress,
        player: playerAddress,
        agent: this.wallet.publicKey,
      })
      .rpc();
    
    return tx;
  }
}
```

**Command for Claude Code**:
```bash
claude code "Create transaction signer service for agent to sign verify_task instructions in agent/src/transaction-signer.ts"
```

---

### Task 3.4: Agent API Server 🔴
**File**: `agent/src/index.ts`

**Description**: Express server exposing verification endpoints

```typescript
import express from 'express';
import { TaskGenerator } from './task-generator';
import { ImageVerifier } from './image-verifier';
import { TransactionSigner } from './transaction-signer';

const app = express();
app.use(express.json());

const taskGenerator = new TaskGenerator(openai);
const imageVerifier = new ImageVerifier(openai);
const txSigner = new TransactionSigner(/* ... */);

app.post('/api/generate-task', async (req, res) => {
  const { theme } = req.body;
  const task = await taskGenerator.generateDailyTask(theme);
  res.json({ task });
});

app.post('/api/verify', async (req, res) => {
  const { image, task, lobby, player } = req.body;
  
  const isValid = await imageVerifier.verifyImage(image, task);
  
  if (isValid) {
    const signature = await txSigner.verifyPlayer(
      new PublicKey(lobby),
      new PublicKey(player)
    );
    res.json({ verified: true, signature });
  } else {
    res.json({ verified: false });
  }
});

app.listen(3001);
```

**Command for Claude Code**:
```bash
claude code "Create Express API server in agent/src/index.ts with /generate-task and /verify endpoints"
```

---

## Phase 4: Integration & Polish

### Task 4.1: Frontend API Routes 🔴
**Files**:
- `app/src/app/api/generate-task/route.ts`
- `app/src/app/api/verify-image/route.ts`

**Description**: Next.js API routes that proxy to agent service

**Command for Claude Code**:
```bash
claude code "Create Next.js API routes that proxy requests to the agent service for task generation and image verification"
```

---

### Task 4.2: End-to-End Test 🔴
**File**: `tests/e2e.test.ts`

**Description**: Full user flow test

1. Create lobby
2. Generate daily task
3. Join lobby (transfer USDC)
4. Upload image
5. Agent verifies
6. Resolve market
7. Check payouts

**Command for Claude Code**:
```bash
claude code "Create end-to-end test suite that validates complete user flow from lobby creation to payout"
```

---

### Task 4.3: Dark Mode & Polish 🟡
**Description**: UI refinements

- Dark/light mode toggle
- Loading states
- Error handling
- Toast notifications
- Responsive design

**Command for Claude Code**:
```bash
claude code "Add dark mode toggle, loading states, error boundaries, and toast notifications to the frontend"
```

---

## Quick Commands Cheat Sheet

```bash
# Start working on smart contract
claude code "Begin implementing Flake Fund smart contract starting with state structures"

# Work on frontend
claude code "Create Next.js frontend for Flake Fund with Solana wallet integration"

# Build AI agent
claude code "Develop AI agent service with OpenAI Vision API for task verification"

# Run tests
claude code "Write comprehensive test suite for all smart contract instructions"

# Deploy
claude code "Create deployment scripts for devnet deployment"
```

## Progress Tracking

Create a `PROGRESS.md` file to track completion:

```markdown
## Smart Contract
- [x] Task 1.1: Project Setup
- [x] Task 1.2: State Structures
- [ ] Task 1.3: Constants & Errors
...
```

## Tips for Claude Code

1. **Be Specific**: Reference exact file paths and function names
2. **Provide Context**: Include relevant code snippets in your request
3. **One Task at a Time**: Don't try to do multiple tasks in one command
4. **Test Frequently**: Run tests after each task completion
5. **Use Comments**: Add TODO comments for future work

---

Ready to start? Pick any 🟢 Independent task and run the Claude Code command!
