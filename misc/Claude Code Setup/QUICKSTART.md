# Quick Start - The Flake Fund with Claude Code

Get started building The Flake Fund in minutes using Claude Code.

## What is Claude Code?

Claude Code is a command-line tool that lets you delegate coding tasks to Claude directly from your terminal. It's perfect for this project because:

- **Modular architecture**: Each task is independent
- **Clear specifications**: Detailed requirements in TASKS.md
- **Incremental development**: Build feature by feature
- **AI-friendly**: Well-structured, documented codebase

## Installation

```bash
# Install Claude Code (if not already installed)
npm install -g @anthropic-ai/claude-code

# Authenticate
claude-code auth
```

## Getting Started

### Step 1: Clone the Project Structure

```bash
# Create project directory
mkdir flake-fund
cd flake-fund

# Initialize git
git init

# Download documentation files
curl -O https://raw.githubusercontent.com/your-repo/flake-fund/main/README.md
curl -O https://raw.githubusercontent.com/your-repo/flake-fund/main/TASKS.md
curl -O https://raw.githubusercontent.com/your-repo/flake-fund/main/ARCHITECTURE.md
curl -O https://raw.githubusercontent.com/your-repo/flake-fund/main/SETUP.md
```

### Step 2: Setup Solana Environment

```bash
# Generate keypair
solana-keygen new --outfile ~/.config/solana/devnet.json

# Set to devnet
solana config set --url devnet

# Airdrop SOL
solana airdrop 2
```

---

## Phase 1: Smart Contract (Estimated: 4-6 hours)

### Task 1: Initialize Anchor Project

```bash
# Create Anchor workspace
claude code "Initialize an Anchor project named 'flake-fund' with the following structure:
- Program name: flake_fund
- Use Anchor version 0.29.0
- Setup src/ directory with subdirectories: state/, instructions/
- Add dependencies: anchor-lang, anchor-spl
- Create empty files: state/lobby.rs, state/player_status.rs, instructions/create_lobby.rs, instructions/join_lobby.rs, instructions/verify_task.rs, instructions/resolve_market.rs, errors.rs, constants.rs
- Configure Anchor.toml for devnet deployment"
```

**Expected Output**: Complete Anchor project structure ready for development

---

### Task 2: Define State Structures

```bash
claude code "In anchor/programs/flake-fund/src/state/, create Rust structs for Lobby and PlayerStatus accounts with these specifications:

Lobby:
- authority: Pubkey (who created the lobby)
- task_description: String (max 100 chars)
- entry_fee: u64 (in USDC lamports)
- charity_wallet: Pubkey
- market_close: i64 (unix timestamp)
- total_pot: u64
- verified_count: u8
- total_players: u8
- is_resolved: bool
- bump: u8

PlayerStatus:
- player: Pubkey
- lobby: Pubkey
- has_deposited: bool
- is_verified: bool
- has_claimed: bool
- timestamp: i64
- bump: u8

Include:
- #[account] attribute on each struct
- LEN constant for space calculation (8 + field sizes)
- SEED_PREFIX constant for PDA derivation
- Proper imports from anchor_lang::prelude::*"
```

**Expected Output**: Complete state structures with proper Account attributes

---

### Task 3: Define Errors and Constants

```bash
claude code "Create two files in anchor/programs/flake-fund/src/:

1. errors.rs with FlakeFundError enum containing:
   - MarketClosed
   - MarketStillOpen
   - AlreadyDeposited
   - NotVerified
   - AlreadyClaimed
   - InsufficientFunds
   - InvalidCharityPercentage
   - Unauthorized
   Each with descriptive error messages

2. constants.rs with:
   - ENTRY_FEE: u64 = 10_000_000 (10 USDC)
   - CHARITY_PERCENTAGE: u8 = 50
   - MARKET_DURATION: i64 = 86400 (24 hours)
   - MAX_TASK_DESCRIPTION_LEN: usize = 100"
```

**Expected Output**: Error handling and constants defined

---

### Task 4: Implement create_lobby Instruction

```bash
claude code "In anchor/programs/flake-fund/src/instructions/create_lobby.rs, implement the create_lobby instruction:

Context accounts:
- lobby: Init PDA with seeds [b'lobby', authority, task_description], payer = authority
- authority: Signer (mut)
- charity_wallet: UncheckedAccount
- system_program: Program<System>

Handler function should:
1. Validate task_description length
2. Initialize lobby with provided parameters
3. Set market_close to current time + MARKET_DURATION
4. Set initial values: total_pot = 0, verified_count = 0, total_players = 0
5. Store bump seed

Return Result<()>"
```

**Expected Output**: Working create_lobby instruction

---

### Task 5: Implement join_lobby Instruction

```bash
claude code "In anchor/programs/flake-fund/src/instructions/join_lobby.rs, implement the join_lobby instruction for USDC token transfers:

Context accounts:
- lobby: Account<Lobby> (mut, PDA with constraint)
- player_status: Init PDA with seeds [b'player_status', lobby, player]
- player: Signer (mut)
- player_token: Account<TokenAccount> (mut, constraint: owner = player, mint = USDC)
- vault: Account<TokenAccount> (mut, PDA seeds [b'vault', lobby])
- usdc_mint: UncheckedAccount
- token_program: Program<Token>
- system_program: Program<System>

Handler logic:
1. Check market is still open
2. Create PlayerStatus account
3. Transfer entry_fee USDC from player_token to vault using anchor_spl::token::transfer
4. Update lobby.total_pot and lobby.total_players
5. Set player_status fields (has_deposited = true, is_verified = false)

Use CPI (Cross-Program Invocation) for token transfer"
```

**Expected Output**: Working USDC escrow functionality

---

### Task 6: Implement verify_task Instruction

```bash
claude code "In anchor/programs/flake-fund/src/instructions/verify_task.rs, implement the verify_task instruction (only callable by agent):

Context accounts:
- lobby: Account<Lobby> (PDA with constraint)
- player_status: Account<PlayerStatus> (mut, PDA with constraint)
- player: UncheckedAccount
- agent: Signer (mut, constraint: key() == lobby.authority)

Handler logic:
1. Verify market is still open
2. Verify player has deposited
3. Verify player not already verified
4. Set player_status.is_verified = true
5. Increment lobby.verified_count

This instruction can ONLY be called by the authorized agent keypair"
```

**Expected Output**: Agent-only verification instruction

---

### Task 7: Implement resolve_market Instruction

```bash
claude code "In anchor/programs/flake-fund/src/instructions/resolve_market.rs, implement the parimutuel payout logic:

Context accounts:
- lobby: Account<Lobby> (mut)
- player_status: Account<PlayerStatus> (mut)
- player: Signer (mut)
- vault: Account<TokenAccount> (mut, PDA with signer seeds)
- player_token: Account<TokenAccount> (mut)
- charity_token: Account<TokenAccount> (mut)
- token_program: Program<Token>

Handler logic:
1. Check market is closed (unix_timestamp >= market_close)
2. Check player is verified
3. Check player hasn't claimed
4. Calculate parimutuel formula:
   - forfeited = (total_players - verified_count) × entry_fee
   - charity_amount = forfeited × 50%
   - reward_pool = forfeited × 50%
   - payout_per_winner = entry_fee + (reward_pool / verified_count)
5. Transfer charity_amount to charity_token using vault as signer
6. Transfer payout_per_winner to player_token using vault as signer
7. Set player_status.has_claimed = true

Use invoke_signed for vault transfers with PDA seeds"
```

**Expected Output**: Complete payout distribution logic

---

### Task 8: Wire Everything Together

```bash
claude code "In anchor/programs/flake-fund/src/lib.rs:

1. Import all modules: state, instructions, errors, constants
2. Create program module with declare_id!('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
3. Export all public instruction functions:
   - create_lobby(ctx, task_description, entry_fee)
   - join_lobby(ctx)
   - verify_task(ctx)
   - resolve_market(ctx)
4. Create mod.rs files in state/ and instructions/ to re-export modules

Then build the program with 'anchor build' and show me the program ID"
```

**Expected Output**: Complete, buildable Anchor program

---

### Task 9: Write Tests

```bash
claude code "In anchor/tests/flake-fund.ts, create comprehensive tests:

1. Setup:
   - Create test provider and program
   - Create test wallets and USDC token accounts
   - Setup charity wallet

2. Test cases:
   - Create lobby successfully
   - Join lobby with USDC transfer
   - Verify task as agent (should succeed)
   - Verify task as non-agent (should fail)
   - Resolve market and check payouts
   - Test edge cases: market closed, already claimed, zero winners

3. Verify math:
   - With 10 players, 8 verified, 2 failed
   - Entry fee 10 USDC
   - Forfeited: 20 USDC
   - To charity: 10 USDC
   - To winners: 10 USDC / 8 = 1.25 USDC each
   - Each winner gets: 10 + 1.25 = 11.25 USDC

Use chai assertions and proper async/await"
```

**Expected Output**: Full test suite passing

---

## Phase 2: Frontend (Estimated: 4-6 hours)

### Task 10: Initialize Next.js App

```bash
claude code "Create a Next.js 14 app in app/ directory with:

1. Setup:
   - TypeScript
   - Tailwind CSS
   - App Router
   - ESLint

2. Install dependencies:
   - @solana/wallet-adapter-react
   - @solana/wallet-adapter-react-ui
   - @solana/wallet-adapter-wallets
   - @solana/web3.js
   - @project-serum/anchor
   - lucide-react
   - react-hot-toast

3. Create folder structure:
   - src/app/ (pages)
   - src/components/ (reusable UI)
   - src/lib/ (utilities)
   - src/types/ (TypeScript types)

4. Configure tailwind.config.js with custom theme:
   - Dark color scheme
   - Custom fonts
   - Animation utilities"
```

**Expected Output**: Next.js project scaffolded

---

### Task 11: Setup Wallet Provider

```bash
claude code "Create src/components/wallet/WalletProvider.tsx:

1. Wrap ConnectionProvider and WalletProvider from @solana/wallet-adapter-react
2. Configure for devnet: https://api.devnet.solana.com
3. Include Phantom wallet adapter
4. Add WalletModalProvider for connect UI
5. Enable autoConnect

Then update src/app/layout.tsx to wrap children with WalletProvider

Add a ConnectWallet button component in src/components/wallet/ConnectButton.tsx using WalletMultiButton"
```

**Expected Output**: Wallet connection working

---

### Task 12: Create Program SDK

```bash
claude code "Create src/lib/solana/program.ts with a FlakeFundProgram class:

Methods needed:
- initialize(connection, wallet): Create program instance
- createLobby(taskDescription, entryFee, charityWallet): Call create_lobby instruction
- joinLobby(lobbyAddress): Call join_lobby instruction with USDC transfer
- getLobbyData(lobbyAddress): Fetch and return Lobby account
- getPlayerStatus(lobbyAddress, playerAddress): Fetch PlayerStatus
- getAllLobbies(): Fetch all lobby accounts

Use:
- @project-serum/anchor for Program creation
- PublicKey.findProgramAddress for PDA derivation
- getAssociatedTokenAddress for token accounts

Include proper TypeScript types for all methods"
```

**Expected Output**: TypeScript SDK for smart contract interaction

---

### Task 13: Build Lobby Listing Page

```bash
claude code "Create the dashboard page at src/app/dashboard/page.tsx:

1. Fetch all lobbies using FlakeFundProgram.getAllLobbies()
2. Display in a grid layout using Tailwind
3. Each lobby card shows:
   - Task description
   - Entry fee (in USDC)
   - Number of participants
   - Time remaining (countdown)
   - Join button
4. Add filters: Active, Closed, My Lobbies
5. Add loading skeleton
6. Handle empty state

Create reusable LobbyCard component in src/components/lobby/LobbyCard.tsx

Use lucide-react for icons, react-hot-toast for notifications"
```

**Expected Output**: Working lobby list with real on-chain data

---

### Task 14: Build Lobby Detail Page

```bash
claude code "Create dynamic route at src/app/lobby/[id]/page.tsx:

Show:
1. Lobby header:
   - Task description (large)
   - Theme badge
   - Status (open/closed)

2. Stats grid:
   - Total pot (USDC)
   - Participants (current/total)
   - Entry fee
   - Time remaining

3. Daily task section:
   - Show today's AI-generated task
   - Image upload area (if user joined)
   - Verification status badge

4. Participants list:
   - Show all players
   - Verification checkmarks
   - User's own status highlighted

5. Actions:
   - Join button (if not joined)
   - Claim winnings button (if market closed & verified)

Use React hooks for state management and real-time updates"
```

**Expected Output**: Full lobby detail view with interactions

---

### Task 15: Add Image Upload Component

```bash
claude code "Create src/components/ImageUpload.tsx:

Features:
1. Drag-and-drop zone
2. File input fallback
3. Image preview
4. Client-side compression (max 1MB)
5. Convert to base64
6. Upload to API route /api/verify-image

UI:
- Dashed border when idle
- Solid border on drag over
- Preview with remove button
- Upload progress indicator
- Success/error states

Use native file APIs, no external libraries needed

Include loading spinner during upload"
```

**Expected Output**: Working image upload with preview

---

## Phase 3: AI Agent (Estimated: 3-4 hours)

### Task 16: Initialize Agent Service

```bash
claude code "Create agent service in agent/ directory:

1. Setup:
   - Initialize Node.js project
   - TypeScript configuration
   - Install dependencies: express, @solana/web3.js, @project-serum/anchor, openai, dotenv, cors

2. Create src/index.ts with Express server:
   - POST /api/generate-task
   - POST /api/verify-image
   - Health check endpoint
   - Error handling middleware
   - CORS configuration

3. Create .env.example with required variables:
   - SOLANA_RPC_URL
   - PROGRAM_ID
   - AGENT_KEYPAIR_PATH
   - OPENAI_API_KEY
   - PORT

4. Add scripts to package.json:
   - dev: ts-node src/index.ts
   - build: tsc
   - start: node dist/index.js"
```

**Expected Output**: Express API server skeleton

---

### Task 17: Implement Task Generator

```bash
claude code "Create agent/src/task-generator.ts:

TaskGenerator class with:
1. Theme-based prompts:
   - fitness: gym equipment, running shoes, healthy meals
   - productivity: GitHub commits, book pages, deep work timer
   - wellness: outdoor scenes, meditation, water intake

2. generateDailyTask(theme: string): Promise<string>
   - Randomly select base prompt from theme
   - Use OpenAI GPT-4 to add unique twist
   - Ensure task is specific and verifiable
   - Return final task string

3. Add anti-cheat elements:
   - Require specific times
   - Require hand gestures
   - Require specific angles

Example output: 'Show gym equipment with your phone displaying 7:43 AM and give a thumbs up'

Use OpenAI SDK, handle errors gracefully"
```

**Expected Output**: AI task generation service

---

### Task 18: Implement Image Verifier

```bash
claude code "Create agent/src/image-verifier.ts:

ImageVerifier class with:
1. verifyImage(imageBase64: string, taskDescription: string): Promise<VerificationResult>

2. Use OpenAI Vision API (gpt-4-vision-preview):
   - Send image as base64
   - Prompt: 'Analyze this image. Does it match this requirement: {task}? Return JSON: {verified: boolean, confidence: 0-100, reason: string}'
   - Parse response
   - Return structured result

3. VerificationResult type:
   - verified: boolean
   - confidence: number
   - reason: string
   - timestamp: number

4. Validation rules:
   - Confidence must be >= 80% to pass
   - Check for image quality
   - Detect obvious fakes (screenshots, edited images)

Handle OpenAI API errors, rate limits, and timeouts"
```

**Expected Output**: Vision-based verification service

---

### Task 19: Implement Transaction Signer

```bash
claude code "Create agent/src/transaction-signer.ts:

TransactionSigner class with:
1. Constructor loads agent keypair from .env path
2. Connects to Solana via RPC
3. Creates Anchor program instance

Methods:
- verifyPlayer(lobbyPubkey: PublicKey, playerPubkey: PublicKey): Promise<string>
  - Derive PlayerStatus PDA
  - Build verify_task instruction
  - Sign with agent keypair
  - Send transaction
  - Return signature

- getBalance(): Promise<number>
  - Check agent's SOL balance
  - Throw error if too low

Include proper error handling for:
- Insufficient balance
- Network errors
- Invalid PDAs
- Transaction failures

Log all transactions for debugging"
```

**Expected Output**: Automated transaction signing service

---

### Task 20: Wire Agent Endpoints

```bash
claude code "In agent/src/index.ts, implement the API routes:

POST /api/generate-task:
- Body: { theme: string, lobbyId: string }
- Call TaskGenerator.generateDailyTask(theme)
- Store task-lobby mapping in memory
- Return: { task: string, timestamp: number }

POST /api/verify-image:
- Body: { image: string (base64), task: string, lobby: string, player: string }
- Call ImageVerifier.verifyImage()
- If verified && confidence >= 80%:
  - Call TransactionSigner.verifyPlayer()
  - Return: { verified: true, signature: string, confidence: number }
- Else:
  - Return: { verified: false, reason: string, confidence: number }

Add rate limiting (10 requests/minute per IP)
Add request logging
Add input validation

Start server on PORT from .env"
```

**Expected Output**: Complete AI agent API

---

## Phase 4: Integration (Estimated: 2-3 hours)

### Task 21: Create Frontend API Routes

```bash
claude code "Create Next.js API routes in src/app/api/:

1. src/app/api/generate-task/route.ts:
   - POST handler
   - Forward request to agent service
   - Add error handling
   - Return task to frontend

2. src/app/api/verify-image/route.ts:
   - POST handler
   - Receive image upload
   - Compress if needed
   - Forward to agent service
   - Return verification result

Both should:
- Validate requests
- Handle agent service downtime
- Add logging
- Return proper status codes

Use Next.js 14 App Router API route format"
```

**Expected Output**: API proxy layer between frontend and agent

---

### Task 22: Connect Everything

```bash
claude code "Update the lobby detail page to integrate all pieces:

Flow:
1. On page load:
   - Fetch lobby data from blockchain
   - Call /api/generate-task to get today's task
   - Display task to user

2. When user uploads image:
   - Show loading state
   - Call /api/verify-image
   - Display result (verified or failed)
   - If verified, show success message
   - Poll blockchain for updated player_status

3. When market closes:
   - Enable 'Claim Winnings' button
   - On click, call FlakeFundProgram.resolveMarket()
   - Show transaction in Phantom
   - Display success and amount won

Add proper error handling at each step
Use toast notifications for feedback
Add loading spinners during async operations"
```

**Expected Output**: Complete end-to-end user flow

---

### Task 23: Add Dashboard Features

```bash
claude code "Enhance src/app/dashboard/page.tsx with:

1. User stats section at top:
   - Total winnings (query all resolved lobbies where user won)
   - Active lobbies count
   - Win rate percentage
   - Current streak

2. Lobby filtering:
   - All, Active, Completed, My Lobbies
   - Search by task description
   - Sort by: newest, oldest, most participants, highest pot

3. Create lobby button:
   - Opens modal with form
   - Fields: task description, entry fee, charity wallet
   - Calls FlakeFundProgram.createLobby()
   - Redirects to new lobby on success

4. Real-time updates:
   - Poll for new lobbies every 30 seconds
   - Update countdown timers every second
   - Highlight lobbies user has joined

Make it responsive for mobile"
```

**Expected Output**: Polished dashboard with all features

---

## Phase 5: Polish (Estimated: 2-3 hours)

### Task 24: Add Loading States

```bash
claude code "Add proper loading states throughout the app:

1. Skeleton loaders for:
   - Lobby cards while fetching
   - Lobby detail data
   - User stats

2. Spinners for:
   - Transaction processing
   - Image upload
   - API calls

3. Progress indicators for:
   - Create lobby flow (3 steps)
   - Join lobby flow
   - Claim winnings flow

Create reusable components:
- src/components/ui/Skeleton.tsx
- src/components/ui/Spinner.tsx
- src/components/ui/ProgressBar.tsx

Use Tailwind for animations"
```

**Expected Output**: Professional loading UX

---

### Task 25: Error Handling

```bash
claude code "Add comprehensive error handling:

1. Smart contract errors:
   - Parse Anchor error codes
   - Show user-friendly messages
   - Suggest solutions (e.g., 'Get USDC from faucet')

2. Network errors:
   - Detect timeout
   - Offer retry button
   - Show connection status

3. Wallet errors:
   - Detect wallet not connected
   - Detect wrong network
   - Prompt to switch to devnet

4. Form validation:
   - Check entry fee > 0
   - Check task description length
   - Check charity wallet is valid

Create ErrorBoundary component
Add try-catch around all async operations
Use toast notifications for errors"
```

**Expected Output**: Robust error handling

---

### Task 26: Mobile Responsive Design

```bash
claude code "Make the entire app mobile responsive:

1. Update layouts:
   - Single column on mobile
   - Grid on desktop
   - Responsive navigation

2. Touch-friendly:
   - Larger buttons
   - Better tap targets
   - Swipe gestures for image upload

3. Test on:
   - iPhone (390px)
   - iPad (768px)
   - Desktop (1280px+)

4. Mobile-specific features:
   - Bottom navigation bar
   - Slide-up modals
   - Pull-to-refresh

Use Tailwind breakpoints: sm, md, lg, xl
Test with Chrome DevTools mobile emulation"
```

**Expected Output**: Fully responsive UI

---

## Testing Checklist

### Manual Testing

```bash
# Test smart contract
cd anchor
anchor test

# Test frontend
cd app
npm run build
npm run dev

# Test agent
cd agent
npm run build
npm run dev

# End-to-end test:
# 1. Connect wallet
# 2. Create lobby
# 3. Join with USDC
# 4. Upload photo
# 5. Verify AI response
# 6. Wait for market close
# 7. Claim winnings
# 8. Verify payout
```

### Common Issues

```bash
# If program not found:
claude code "Debug the program deployment issue by checking:
1. Is the program ID in lib.rs correct?
2. Does Anchor.toml have the right ID?
3. Is .env.local updated?
4. Try redeploying with 'anchor deploy --provider.cluster devnet'"

# If wallet won't connect:
claude code "Debug wallet connection by checking:
1. Is Phantom installed?
2. Is wallet set to devnet?
3. Are wallet adapter dependencies installed?
4. Check browser console for errors"

# If USDC transfer fails:
claude code "Debug USDC transfer by checking:
1. Does user have USDC token account?
2. Is USDC mint address correct?
3. Does user have enough USDC?
4. Is vault PDA derived correctly?"
```

---

## Deployment

### Deploy Smart Contract

```bash
# Build and deploy
cd anchor
anchor build
anchor deploy --provider.cluster devnet

# Update all configs with new program ID
claude code "Update the program ID in:
- anchor/programs/flake-fund/src/lib.rs (declare_id!)
- anchor/Anchor.toml
- app/.env.local (NEXT_PUBLIC_PROGRAM_ID)
- agent/.env (PROGRAM_ID)"
```

### Deploy Frontend

```bash
cd app

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Deploy Agent

```bash
cd agent

# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up

# Set environment variables in Railway dashboard
```

---

## Demo Preparation

```bash
claude code "Create a demo script with:

1. Seed data:
   - Create 3 demo lobbies (Fitness, Productivity, Wellness)
   - Fund demo wallets with USDC
   - Prepare 5-10 demo images

2. Demo flow:
   - Show landing page (30 sec)
   - Create lobby (1 min)
   - Join lobby (1 min)
   - Show AI task generation (1 min)
   - Upload and verify image (2 min)
   - Show market resolution (1 min)
   - Show payout distribution (1 min)

3. Backup plan:
   - Record demo video
   - Prepare slides
   - Have screenshots ready

Total demo time: 7-8 minutes"
```

---

## Tips for Claude Code

### Best Practices

1. **Be Specific**: Include exact file paths and function names
2. **Provide Context**: Reference related files and dependencies
3. **One Task at a Time**: Don't combine multiple tasks in one command
4. **Test Frequently**: Run tests after each major task
5. **Use Comments**: Add TODO comments for future work

### Example Commands

```bash
# Good: Specific and focused
claude code "Create the Lobby struct in anchor/programs/flake-fund/src/state/lobby.rs with fields for authority, task_description, entry_fee, and charity_wallet"

# Bad: Too vague
claude code "Make the smart contract"

# Good: Includes context
claude code "Update the join_lobby instruction to use anchor_spl::token::transfer for USDC. The vault PDA should be derived with seeds [b'vault', lobby.key()]. Include proper error handling for insufficient balance."

# Bad: Missing details
claude code "Add token transfer"
```

---

## Progress Tracking

Create a `PROGRESS.md` file:

```markdown
## Smart Contract
- [x] Task 1: Initialize Anchor project
- [x] Task 2: Define state structures
- [ ] Task 3: Define errors and constants
...

## Current Task
Working on Task 12: Create Program SDK

## Blockers
None

## Next Up
Task 13: Build lobby listing page
```

---

## Getting Help

If stuck, try these commands:

```bash
# Explain code
claude code "Explain how the PDA derivation works in join_lobby instruction"

# Debug issue
claude code "Debug why the token transfer is failing. Check the vault PDA seeds and token account constraints"

# Refactor code
claude code "Refactor the ImageVerifier class to be more modular and add unit tests"

# Add feature
claude code "Add a feature to allow users to appeal failed verifications by storing the image on IPFS and submitting for human review"
```

---

## Success Indicators

You'll know you're on track when:

- [ ] Smart contract builds without errors
- [ ] All tests pass
- [ ] Frontend connects to wallet
- [ ] Can create and join lobbies
- [ ] USDC transfers work
- [ ] AI generates unique tasks
- [ ] AI verifies images correctly
- [ ] Payouts distribute properly
- [ ] UI is polished and responsive

---

**You're ready to build! Start with Task 1 and work through systematically. Good luck! 🚀**

Remember: Claude Code is best used for focused, well-defined tasks. Break big problems into small pieces.
