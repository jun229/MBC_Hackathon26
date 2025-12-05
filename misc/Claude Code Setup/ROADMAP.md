# Hackathon Roadmap - The Flake Fund

Track your progress and stay on schedule for the hackathon.

## Timeline: 48-Hour Hackathon

### Day 1 (Hours 0-12): Foundation
**Goal**: Working smart contract + basic frontend

#### Morning (Hours 0-6)
- [ ] **Hour 0-1**: Setup & Planning
  - [ ] Clone repo structure
  - [ ] Setup Solana devnet wallet
  - [ ] Get devnet USDC
  - [ ] Initialize Anchor project
  
- [ ] **Hour 1-4**: Smart Contract Core
  - [ ] Define state structures (Lobby, PlayerStatus)
  - [ ] Implement create_lobby instruction
  - [ ] Implement join_lobby instruction
  - [ ] Write unit tests
  - [ ] Deploy to devnet
  
- [ ] **Hour 4-6**: Frontend Scaffolding
  - [ ] Setup Next.js + Tailwind
  - [ ] Configure Solana wallet adapter
  - [ ] Create basic layout/navigation
  - [ ] Setup routing

#### Afternoon (Hours 6-12)
- [ ] **Hour 6-8**: Smart Contract Completion
  - [ ] Implement verify_task instruction
  - [ ] Implement resolve_market instruction
  - [ ] Test full flow on devnet
  - [ ] Generate TypeScript IDL
  
- [ ] **Hour 8-10**: Frontend Core
  - [ ] Create program integration SDK
  - [ ] Build lobby listing page
  - [ ] Build lobby detail page
  - [ ] Connect wallet functionality
  
- [ ] **Hour 10-12**: First Integration
  - [ ] Connect frontend to smart contract
  - [ ] Test create lobby from UI
  - [ ] Test join lobby with real USDC
  - [ ] Debug any issues

**Day 1 Checkpoint**: 
✅ Users can create and join lobbies with real USDC on devnet

---

### Day 1 Evening (Hours 12-18): AI Integration
**Goal**: Working AI verification system

#### Evening (Hours 12-18)
- [ ] **Hour 12-14**: Agent Service Setup
  - [ ] Initialize Express server
  - [ ] Setup OpenAI API connection
  - [ ] Create task generator service
  - [ ] Test task generation

- [ ] **Hour 14-16**: Image Verification
  - [ ] Build image verifier service
  - [ ] Implement Vision API calls
  - [ ] Create transaction signer
  - [ ] Test verification flow

- [ ] **Hour 16-18**: Frontend Integration
  - [ ] Add image upload component
  - [ ] Create API routes (/generate-task, /verify)
  - [ ] Connect UI to agent service
  - [ ] Test end-to-end flow

**Day 1 End Checkpoint**: 
✅ Complete flow: Create lobby → Join → Upload photo → AI verifies → Smart contract updates

---

### Day 2 Morning (Hours 18-24): Refinement
**Goal**: Polish UI and add missing features

#### Morning (Hours 18-24)
- [ ] **Hour 18-20**: Market Resolution
  - [ ] Build claim winnings UI
  - [ ] Test payout calculations
  - [ ] Verify charity distribution
  - [ ] Test edge cases (zero winners, late claims)

- [ ] **Hour 20-22**: UI Polish
  - [ ] Add loading states
  - [ ] Add error handling
  - [ ] Add success notifications
  - [ ] Improve responsive design

- [ ] **Hour 22-24**: Dashboard & History
  - [ ] Build user dashboard with stats
  - [ ] Create history page
  - [ ] Add lobby filters/sorting
  - [ ] Polish mobile experience

**Day 2 Morning Checkpoint**: 
✅ Fully functional app with polished UI

---

### Day 2 Afternoon (Hours 24-36): Demo Prep
**Goal**: Working demo with sample data

#### Afternoon (Hours 24-30)
- [ ] **Hour 24-26**: Testing & Debugging
  - [ ] Full end-to-end test
  - [ ] Test all error states
  - [ ] Fix critical bugs
  - [ ] Performance optimization

- [ ] **Hour 26-28**: Demo Content
  - [ ] Create demo lobbies with different themes
  - [ ] Prepare sample images
  - [ ] Setup demo wallets with USDC
  - [ ] Record demo video

- [ ] **Hour 28-30**: Documentation
  - [ ] Write clear README
  - [ ] Document API endpoints
  - [ ] Add code comments
  - [ ] Create architecture diagram

#### Evening (Hours 30-36)
- [ ] **Hour 30-32**: Presentation
  - [ ] Create pitch deck
  - [ ] Practice demo script
  - [ ] Record backup video
  - [ ] Test on different browsers

- [ ] **Hour 32-34**: Final Polish
  - [ ] Fix any remaining bugs
  - [ ] Improve loading times
  - [ ] Add final UI touches
  - [ ] Test on mobile

- [ ] **Hour 34-36**: Buffer & Sleep
  - [ ] Address any last issues
  - [ ] Get some rest
  - [ ] Prepare for presentation

---

### Day 2 Evening (Hours 36-48): Deployment & Presentation
**Goal**: Live demo ready

#### Final Hours (Hours 36-42)
- [ ] **Hour 36-38**: Deployment
  - [ ] Deploy frontend to Vercel
  - [ ] Deploy agent to Railway
  - [ ] Test production environment
  - [ ] Update environment variables

- [ ] **Hour 38-40**: Demo Rehearsal
  - [ ] Walk through entire demo
  - [ ] Time the presentation
  - [ ] Prepare for Q&A
  - [ ] Setup backup plans

- [ ] **Hour 40-42**: Final Checks
  - [ ] Verify all links work
  - [ ] Test on fresh browser
  - [ ] Check mobile experience
  - [ ] Prepare contingencies

#### Presentation (Hours 42-48)
- [ ] **Hour 42-44**: Pre-Demo Setup
  - [ ] Load demo lobbies
  - [ ] Prepare demo accounts
  - [ ] Test internet connection
  - [ ] Open all required tabs

- [ ] **Hour 44-48**: Showtime
  - [ ] Deliver pitch (5 min)
  - [ ] Live demo (10 min)
  - [ ] Q&A (5 min)
  - [ ] Submit project

---

## Critical Path Items ⚡

These must work for a successful demo:

1. **Smart Contract**: Create lobby, join lobby, verify task, resolve market
2. **AI Verification**: Generate unique daily task, verify photo with Vision API
3. **USDC Flow**: Deposit on join, distribute on resolve
4. **UI Polish**: Professional look, no crashes, good UX

---

## MVP Feature Checklist

### Must Have (P0) 🔴
- [x] User can connect Phantom wallet
- [ ] User can create a lobby
- [ ] User can join a lobby with USDC
- [ ] AI generates unique daily task
- [ ] User can upload photo
- [ ] AI verifies photo matches task
- [ ] Smart contract tracks verification
- [ ] User can claim winnings after market closes
- [ ] Charity receives 50% of forfeitures
- [ ] UI shows lobby list
- [ ] UI shows lobby details
- [ ] UI shows user stats

### Should Have (P1) 🟡
- [ ] Dashboard shows total winnings
- [ ] History page shows past lobbies
- [ ] Lobby shows countdown timer
- [ ] UI shows verification status
- [ ] Error messages are helpful
- [ ] Loading states on all actions
- [ ] Mobile responsive design
- [ ] Multiple theme options

### Nice to Have (P2) 🟢
- [ ] Dark mode toggle
- [ ] Social share buttons
- [ ] Lobby chat
- [ ] User profile page
- [ ] Leaderboard
- [ ] Email notifications
- [ ] Achievement badges

---

## Demo Script

### Setup (2 minutes before)
1. Open browser with 3 tabs:
   - Tab 1: Landing page
   - Tab 2: Dashboard
   - Tab 3: Lobby detail
2. Have Phantom wallet ready
3. Have demo images ready
4. Check internet connection

### Pitch (3 minutes)
> "Imagine you and your friends want to go to the gym every day, but you always flake. What if you could bet on yourselves, and winners split the pot from those who didn't show up?
> 
> That's The Flake Fund. It's social accountability gamified with AI and crypto.
> 
> Here's how it works:
> 1. Friends create a lobby around a theme like 'Fitness'
> 2. Everyone deposits USDC as a stake
> 3. Every day, an AI generates a unique challenge you can't fake
> 4. Complete the task and upload proof
> 5. Winners split the money from those who flaked
> 6. 50% of lost stakes go to charity
> 
> The genius? The AI makes cheating impossible by requiring specific, unpredictable elements in your proof."

### Demo (7 minutes)

**Part 1: Show the Problem (1 min)**
- "Traditional accountability apps? No stakes. Habit trackers? No friends. Betting apps? Against strangers."
- "We combine all three: stakes, friends, and competition."

**Part 2: Create a Lobby (2 min)**
- Click "Create Lobby"
- Fill in: "Morning Workout" theme, 10 USDC entry
- Show smart contract transaction in Phantom
- "Now the AI will generate unique challenges each day"

**Part 3: AI Challenge (2 min)**
- Show generated task: "Take a photo of gym equipment with your phone showing 7:43 AM"
- Upload demo photo
- Show AI verification in progress
- "GPT-4 Vision just verified this is real gym equipment at the right time"
- Show verified status on chain

**Part 4: The Payout (2 min)**
- Show lobby stats: "8 completed, 2 flaked"
- Click "Resolve Market"
- Show calculation: 
  - 2 × 10 USDC forfeited = 20 USDC
  - 50% → Charity (10 USDC)
  - 50% → Winners (10 USDC / 8 = 1.25 USDC each)
- "Winners each get back 11.25 USDC. Flakers lost 10 USDC."

### Q&A Prep

**Q: What prevents users from using old photos?**
A: The AI generates unique requirements daily (specific times, hand gestures, etc.), so old photos won't match.

**Q: How do you prevent the AI from being biased?**
A: We use GPT-4 Vision with confidence scores. We can add human review for appeals in production.

**Q: What if the AI fails to verify a legitimate photo?**
A: We store the image on IPFS. Users can appeal, and we have a governance mechanism for disputes.

**Q: Why Solana instead of Ethereum?**
A: Speed and cost. Daily micro-transactions need to be instant and cheap. Solana delivers both.

**Q: How do you make money?**
A: 2.5% platform fee on all pots. At scale, this covers costs and provides profit.

**Q: Is this gambling?**
A: No, it's skill-based accountability. You control the outcome by completing tasks.

---

## Backup Plans

### If Internet Fails
- Have recorded demo video ready
- Screenshots of key flows
- GitHub repo with detailed README

### If Smart Contract Fails
- Demo on local validator
- Show test outputs
- Walk through code

### If Agent Service Fails
- Show OpenAI Playground results
- Demo locally
- Show cached verification examples

---

## Post-Hackathon Roadmap

### Week 1: Bug Fixes
- [ ] Fix issues found during demo
- [ ] Optimize gas usage
- [ ] Improve AI prompt engineering
- [ ] Add more themes

### Week 2: User Testing
- [ ] Run beta with 10-20 real users
- [ ] Collect feedback
- [ ] Iterate on UX
- [ ] Add requested features

### Month 1: Launch
- [ ] Security audit
- [ ] Deploy to mainnet
- [ ] Launch marketing campaign
- [ ] Open to public

### Month 3: Scale
- [ ] Add more verification methods
- [ ] Implement DAO governance
- [ ] Launch mobile app
- [ ] Expand to new chains

---

## Team Roles (if working in a team)

**Smart Contract Engineer**:
- Implement all Anchor instructions
- Write tests
- Handle deployment

**Frontend Developer**:
- Build Next.js UI
- Solana wallet integration
- Responsive design

**AI/Backend Engineer**:
- OpenAI integration
- Agent service
- Image processing

**Designer/PM**:
- UI/UX design
- Demo preparation
- Pitch deck

---

## Success Metrics

### Demo Day Goals
- [ ] Functional end-to-end demo
- [ ] Zero crashes during presentation
- [ ] Clear value proposition communicated
- [ ] Judges understand the problem/solution
- [ ] Technical complexity is evident

### Judging Criteria

**Innovation (25%)**:
- Novel use of AI for verification
- Unique parimutuel mechanism
- Solves real problem

**Technical Implementation (25%)**:
- Clean smart contract code
- Proper use of PDAs and Anchor
- AI integration quality
- Frontend polish

**Design (20%)**:
- Intuitive UI/UX
- Professional appearance
- Good mobile experience

**Completeness (20%)**:
- Full working demo
- All core features implemented
- No major bugs

**Presentation (10%)**:
- Clear pitch
- Good demo execution
- Answers questions well

---

## Resources Quick Links

### Documentation
- [Solana Docs](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [OpenAI Vision](https://platform.openai.com/docs/guides/vision)

### Tools
- [Solana Explorer](https://explorer.solana.com)
- [Phantom Wallet](https://phantom.app)
- [SPL Token Faucet](https://spl-token-faucet.com)

### Code Examples
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/tests)
- [Solana Cookbook](https://solanacookbook.com)
- [Next.js + Solana](https://github.com/solana-labs/wallet-adapter)

---

## Final Checklist

### Before Submission
- [ ] All code pushed to GitHub
- [ ] README is complete
- [ ] Demo video uploaded
- [ ] Pitch deck ready
- [ ] Project tested on fresh browser
- [ ] Mobile experience verified
- [ ] All team members ready

### During Presentation
- [ ] Speak clearly and confidently
- [ ] Show, don't just tell
- [ ] Emphasize technical innovation
- [ ] Be ready for tough questions
- [ ] Stay under time limit

### After Presentation
- [ ] Thank judges
- [ ] Network with other teams
- [ ] Get feedback
- [ ] Celebrate! 🎉

---

**Good luck! You've got this! 🚀**

Remember: Perfect is the enemy of done. Ship something that works, even if it's not perfect. You can always improve after the hackathon.
