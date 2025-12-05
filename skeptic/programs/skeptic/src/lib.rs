use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("FWe7tP6KvmJUM2CaTJbYw9GFsiZckSt8CkjjddjCK5pG");

#[program]
pub mod skeptic {
    use super::*;

    pub fn create_lobby(
        ctx: Context<CreateLobby>,
        task_description: String,
        entry_fee: u64,
        market_close: i64,
    ) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        lobby.authority = ctx.accounts.authority.key();
        lobby.task_description = task_description;
        lobby.entry_fee = entry_fee;
        lobby.charity_wallet = ctx.accounts.charity_wallet.key();
        lobby.market_close = market_close;
        lobby.total_pot = 0;
        lobby.verified_count = 0;
        lobby.bump = ctx.bumps.lobby;

        msg!("Lobby created with entry fee: {}", entry_fee);
        Ok(())
    }

    pub fn join_lobby(ctx: Context<JoinLobby>) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        let player_status = &mut ctx.accounts.player_status;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp < lobby.market_close, ErrorCode::MarketClosed);
        require!(!player_status.has_deposited, ErrorCode::AlreadyJoined);

        // Transfer USDC from player to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.player_token_account.to_account_info(),
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

        lobby.total_pot += lobby.entry_fee;

        msg!("Player joined. Total pot: {}", lobby.total_pot);
        Ok(())
    }

    pub fn verify_task(ctx: Context<VerifyTask>) -> Result<()> {
        let lobby = &ctx.accounts.lobby;
        let player_status = &mut ctx.accounts.player_status;

        require!(player_status.has_deposited, ErrorCode::NotJoined);
        require!(!player_status.is_verified, ErrorCode::AlreadyVerified);

        // Mark as verified
        player_status.is_verified = true;

        msg!("Player verified for task: {}", lobby.task_description);
        Ok(())
    }

    pub fn resolve_market(ctx: Context<ResolveMarket>) -> Result<()> {
        let lobby = &ctx.accounts.lobby;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp >= lobby.market_close, ErrorCode::MarketNotClosed);

        msg!("Market resolved. Total pot: {}", lobby.total_pot);
        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>, verified_count: u8, total_players: u8) -> Result<()> {
        let lobby = &ctx.accounts.lobby;
        let player_status = &mut ctx.accounts.player_status;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp >= lobby.market_close, ErrorCode::MarketNotClosed);
        require!(player_status.is_verified, ErrorCode::NotVerified);
        require!(!player_status.has_claimed, ErrorCode::AlreadyClaimed);

        // Calculate payout using parimutuel formula
        let losers_count = total_players.checked_sub(verified_count).unwrap();
        let forfeited = (losers_count as u64).checked_mul(lobby.entry_fee).unwrap();
        let charity_amount = forfeited / 2; // 50% to charity
        let reward_pool = forfeited.checked_sub(charity_amount).unwrap();
        let payout_per_winner = lobby.entry_fee + (reward_pool / verified_count as u64);

        // Transfer payout to winner
        let lobby_key = lobby.key();
        let seeds = &[
            b"vault" as &[u8],
            lobby_key.as_ref(),
            &[ctx.bumps.vault],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.player_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, payout_per_winner)?;

        player_status.has_claimed = true;

        msg!("Payout claimed: {}", payout_per_winner);
        Ok(())
    }
}

// ============================================================================
// State Structures
// ============================================================================

#[account]
pub struct Lobby {
    pub authority: Pubkey,       // Creator of the lobby
    pub task_description: String,// "Gym", "Study", etc.
    pub entry_fee: u64,          // e.g., 10 USDC
    pub charity_wallet: Pubkey,  // Where lost funds go
    pub market_close: i64,       // Timestamp
    pub total_pot: u64,          // Total USDC deposited
    pub verified_count: u8,      // Number of winners
    pub bump: u8,                // PDA bump
}

#[account]
pub struct PlayerStatus {
    pub player: Pubkey,
    pub lobby: Pubkey,
    pub has_deposited: bool,
    pub is_verified: bool,
    pub has_claimed: bool,
}

// ============================================================================
// Context Structures
// ============================================================================

#[derive(Accounts)]
pub struct CreateLobby<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 200 + 8 + 32 + 8 + 8 + 1 + 1,
        seeds = [b"lobby", authority.key().as_ref()],
        bump
    )]
    pub lobby: Account<'info, Lobby>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Charity wallet address
    pub charity_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinLobby<'info> {
    #[account(mut)]
    pub lobby: Account<'info, Lobby>,
    #[account(
        init,
        payer = player,
        space = 8 + 32 + 32 + 1 + 1 + 1,
        seeds = [b"player", lobby.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub player_status: Account<'info, PlayerStatus>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", lobby.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyTask<'info> {
    pub lobby: Account<'info, Lobby>,
    #[account(
        mut,
        seeds = [b"player", lobby.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub player_status: Account<'info, PlayerStatus>,
    /// CHECK: Player account
    pub player: AccountInfo<'info>,
    /// CHECK: Only the agent can verify (checked off-chain for demo)
    pub agent: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    pub lobby: Account<'info, Lobby>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub lobby: Account<'info, Lobby>,
    #[account(
        mut,
        seeds = [b"player", lobby.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub player_status: Account<'info, PlayerStatus>,
    pub player: Signer<'info>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", lobby.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// ============================================================================
// Error Codes
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Market has already closed")]
    MarketClosed,
    #[msg("Player has already joined this lobby")]
    AlreadyJoined,
    #[msg("Player has not joined this lobby")]
    NotJoined,
    #[msg("Player has already been verified")]
    AlreadyVerified,
    #[msg("Market has not closed yet")]
    MarketNotClosed,
    #[msg("Player is not verified")]
    NotVerified,
    #[msg("Player has already claimed winnings")]
    AlreadyClaimed,
}
