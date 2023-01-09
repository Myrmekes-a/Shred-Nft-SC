use anchor_lang::{
    prelude::*,
};
use anchor_spl::{
    token::{self, Mint, Token, TokenAccount, Transfer }
};
use metaplex_token_metadata::state::Metadata;

use juiced_ape_evolution::cpi::accounts::NftToMutable;
use juiced_ape_evolution::program::JuicedApeEvolution;
pub use juiced_ape_evolution::{self};

pub mod account;
pub mod error;
pub mod constants;

use account::*;
use error::*;
use constants::*;

declare_id!("5Q5FXSHTABC4URi6KUxT9auirRxo86GukRAYBK7Jweo4");

#[program]
pub mod shred_staking {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        _global_bump: u8,
    ) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;
        global_authority.super_admin = ctx.accounts.admin.key();
        // Err(ProgramError::from(StakingError::InvalidSuperOwner))
        Ok(())
    }

    pub fn initialize_user_pool(
        ctx: Context<InitializeUserPool>
    ) -> Result<()> {
        let mut user_pool = ctx.accounts.user_pool.load_init()?;
        user_pool.owner = ctx.accounts.owner.key();
        msg!("Owner: {:?}", user_pool.owner.to_string());
        // Err(ProgramError::from(StakingError::InvalidSuperOwner))
        Ok(())
    }

    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn stake_nft_to_pool(
        ctx: Context<StakeNftToPool>,
        _global_bump: u8,
        is_legendary: u8,
    ) -> Result<()> {
        let mint_metadata = &mut &ctx.accounts.mint_metadata;

        msg!("Metadata Account: {:?}", ctx.accounts.mint_metadata.key());
        let (metadata, _) = Pubkey::find_program_address(
            &[
                metaplex_token_metadata::state::PREFIX.as_bytes(),
                metaplex_token_metadata::id().as_ref(),
                ctx.accounts.nft_mint.key().as_ref(),
            ],
            &metaplex_token_metadata::id(),
        );
        require!(metadata == mint_metadata.key(), StakingError::InvaliedMetadata);

        // verify metadata is legit
        let nft_metadata = Metadata::from_account_info(mint_metadata)?;
        // let parsed_metadata = Data::deserialize(&mut &mint_metadata.data.borrow()[..]).unwrap();
        // msg!("Pared Metadata: {:?}", parsed_metadata.name);
        // let parsed_metadata: Data = try_from_slice_unchecked(&mint_metadata.data.borrow()[..]).unwrap();
        // msg!("NFT Data name: {:?}", nft_metadata.data.name);

        let mut legendary = is_legendary;

        if let Some(creators) = nft_metadata.data.creators {
            // metaplex constraints this to max 5, so won't go crazy on compute
            // (empirical testing showed there's practically 0 diff between stopping at 0th and 5th creator)
            let mut valid: u8 = 0;
            let mut collection: Pubkey = Pubkey::default();
            for creator in creators {                
                if (creator.address.to_string() == APE_COLLECTION_ADDRESS || creator.address.to_string() == NEW_APE_COLLECTION_ADDRESS || creator.address.to_string() == DIAMOND_COLLECTION_ADDRESS) && creator.verified == true {
                    valid = 1;
                    collection = creator.address;
                    break;
                }
            }

            require!(valid == 1, StakingError::UnkownOrNotAllowedNFTCollection);
            msg!("Collection= {:?}", collection);
            if collection.to_string() == DIAMOND_COLLECTION_ADDRESS {
                legendary = 2;
            }
        } else {
            return Err(Error::from(StakingError::MetadataCreatorParseError));
        };

        let mut user_pool = ctx.accounts.user_pool.load_mut()?;
        msg!("Stake Mint: {:?}", ctx.accounts.nft_mint.key());
        msg!("Is legendary: {}", legendary);

        let timestamp = Clock::get()?.unix_timestamp;
        user_pool.add_nft(ctx.accounts.nft_mint.key(), legendary, timestamp);

        msg!("Count: {}", user_pool.staked_count);
        msg!("Staked Time: {}", timestamp);
        ctx.accounts.global_authority.total_staked_count += 1;

        let token_account_info = &mut &ctx.accounts.user_token_account;
        let dest_token_account_info = &mut &ctx.accounts.dest_nft_token_account;
        let token_program = &mut &ctx.accounts.token_program;

        let cpi_accounts = Transfer {
            from: token_account_info.to_account_info().clone(),
            to: dest_token_account_info.to_account_info().clone(),
            authority: ctx.accounts.owner.to_account_info().clone()
        };
        token::transfer(
            CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
            1
        )?;
        // Err(ProgramError::from(StakingError::InvalidSuperOwner))
        Ok(())
    }
    
    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn withdraw_nft_from_pool(
        ctx: Context<WithdrawNftFromPool>,
        global_bump: u8,
    ) -> Result<()> {
        let mut user_pool = ctx.accounts.user_pool.load_mut()?;
        msg!("Staked Mint: {:?}", ctx.accounts.nft_mint.key());

        let timestamp = Clock::get()?.unix_timestamp;
        let reward: u64 = user_pool.remove_nft(ctx.accounts.nft_mint.key(), timestamp)?;
        msg!("Count: {}", user_pool.staked_count);
        msg!("Unstaked Time: {}", timestamp);
        msg!("Reward: {:?} Remain: {}", reward, user_pool.remaining_rewards);
        ctx.accounts.global_authority.total_staked_count -= 1;

        let token_account_info = &mut &ctx.accounts.user_token_account;
        let dest_token_account_info = &mut &ctx.accounts.dest_nft_token_account;
        let token_program = &mut &ctx.accounts.token_program;
        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: dest_token_account_info.to_account_info().clone(),
            to: token_account_info.to_account_info().clone(),
            authority: ctx.accounts.global_authority.to_account_info()
        };
        token::transfer(
            CpiContext::new_with_signer(token_program.clone().to_account_info(), cpi_accounts, signer),
            1
        )?;
        // Err(ProgramError::from(StakingError::InvalidSuperOwner))
        Ok(())
    }
    
    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn claim_reward(
        ctx: Context<ClaimReward>,
        global_bump: u8,
    ) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
    
        let mut user_pool = ctx.accounts.user_pool.load_mut()?;
        let reward: u64 = user_pool.claim_reward(
            timestamp
        )?;
        msg!("Reward: {:?} Updated Last Reward Time: {}", reward, user_pool.last_reward_time);
        msg!("Remaining: {}", user_pool.remaining_rewards);
        require!(reward > 0, StakingError::InvalidWithdrawTime);
        require!(ctx.accounts.reward_vault.amount >= reward, StakingError::InsufficientRewardVault);

        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];
        let token_program = ctx.accounts.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.user_reward_account.to_account_info(),
            authority: ctx.accounts.global_authority.to_account_info()
        };
        token::transfer(
            CpiContext::new_with_signer(token_program.clone(), cpi_accounts, signer),
            reward
        )?;

        // Err(ProgramError::InvalidAccountData)
        Ok(())
    }
    
    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn mut_bootcamp_nft(
        ctx: Context<MutBootcampNft>,
        global_bump: u8,
        juicing_global_bump: u8,
        nft_bump: u8,
        new_nft_id: String,
    ) -> Result<()> {
        let juicing_nft_info = &mut ctx.accounts.juicing_nft_info;
        require!(
            juicing_nft_info.is_mutable == false,
            StakingError::InvalidMutableRequest
        );

        let global_authority = &mut ctx.accounts.global_authority;
        let nft_mint = &mut ctx.accounts.nft_mint;
        let staked_token_account = &mut ctx.accounts.staked_token_account;
        let new_staked_token_account = &mut ctx.accounts.new_staked_token_account;
        let burning_account = &mut ctx.accounts.burn_account;
        let nft_vault = &mut ctx.accounts.nft_vault;
        let token_program = &mut &ctx.accounts.token_program;

        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];

        let cpi_accounts = NftToMutable {
            owner: global_authority.to_account_info().clone(),
            nft_mint: nft_mint.to_account_info().clone(),
            global_authority: ctx.accounts.juicing_global.to_account_info().clone(),
            nft_pool: juicing_nft_info.to_account_info().clone(),
            user_token_account: staked_token_account.to_account_info().clone(),
            new_user_token_account: new_staked_token_account.to_account_info().clone(),
            nft_vault: nft_vault.to_account_info().clone(),
            burn_account: burning_account.to_account_info().clone(),
            mint_metadata: ctx.accounts.mint_metadata.to_account_info().clone(),
            token_metadata_program: ctx
                .accounts
                .token_metadata_program
                .to_account_info()
                .clone(),
            token_program: token_program.clone().to_account_info(),
        };
        juiced_ape_evolution::cpi::nft_to_mutable(
            CpiContext::new_with_signer(
                ctx.accounts.juicing_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            juicing_global_bump,
            nft_bump,
            new_nft_id,
        )?;

        let mut user_pool = ctx.accounts.user_pool.load_mut()?;
        user_pool.change_mint(nft_mint.key(), ctx.accounts.new_nft_mint.key());

        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(global_bump: u8)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        space = 8 + 40,
        payer = admin
    )]
    pub global_authority: Account<'info, GlobalPool>,

    #[account(
        mut,
        constraint = reward_vault.mint == REWARD_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = reward_vault.owner == global_authority.key(),
        constraint = reward_vault.amount >= MIN_REWARD_DEPOSIT_AMOUNT,
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
pub struct InitializeUserPool<'info> {
    #[account(zero)]
    pub user_pool: AccountLoader<'info, UserPool>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(
    global_bump: u8,
)]
pub struct StakeNftToPool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub user_pool: AccountLoader<'info, UserPool>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump = global_bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == *nft_mint.to_account_info().key,
        constraint = user_token_account.owner == *owner.key,
        constraint = user_token_account.amount == 1,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = dest_nft_token_account.mint == *nft_mint.to_account_info().key,
        constraint = dest_nft_token_account.owner == *global_authority.to_account_info().key,
    )]
    pub dest_nft_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,

    #[account(
        mut,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    
    #[account(constraint = token_metadata_program.key == &metaplex_token_metadata::ID)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(
    global_bump: u8,
)]
pub struct WithdrawNftFromPool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub user_pool: AccountLoader<'info, UserPool>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump = global_bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == *nft_mint.to_account_info().key,
        constraint = user_token_account.owner == *owner.key,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = dest_nft_token_account.mint == *nft_mint.to_account_info().key,
        constraint = dest_nft_token_account.owner == *global_authority.to_account_info().key,
        constraint = dest_nft_token_account.amount == 1,
    )]
    pub dest_nft_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(global_bump: u8)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub user_pool: AccountLoader<'info, UserPool>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump = global_bump,
    )]
    pub global_authority: Account<'info, GlobalPool>,

    #[account(
        mut,
        constraint = reward_vault.mint == REWARD_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = reward_vault.owner == global_authority.key(),
    )]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = user_reward_account.mint == REWARD_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = user_reward_account.owner == owner.key(),
    )]
    pub user_reward_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}


#[derive(Accounts)]
#[instruction(
    global_bump: u8,
)]
pub struct MutBootcampNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub user_pool: AccountLoader<'info, UserPool>,

    pub nft_mint: Account<'info, Mint>,
    pub new_nft_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump = global_bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        owner = juicing_program.key(),
    )]
    pub juicing_global: Account<'info, juiced_ape_evolution::account::GlobalPool>,

    #[account(
        mut,
        owner = juicing_program.key(),
    )]
    pub juicing_nft_info: Account<'info, juiced_ape_evolution::account::NftPool>,

    #[account(
        mut,
        constraint = staked_token_account.mint == nft_mint.key(),
        constraint = staked_token_account.owner == global_authority.key(),
        constraint = staked_token_account.amount == 1,
    )]
    pub staked_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = new_staked_token_account.mint == new_nft_mint.key(),
        constraint = new_staked_token_account.owner == global_authority.key(),
        constraint = staked_token_account.amount == 1,
    )]
    pub new_staked_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = nft_vault.owner == juicing_global.key(),
        constraint = nft_vault.mint == new_nft_mint.key(),
        constraint = nft_vault.amount == 1,
    )]
    pub nft_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub burn_account: Box<Account<'info, TokenAccount>>,

    pub juicing_program: Program<'info, JuicedApeEvolution>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,

    #[account(constraint = token_metadata_program.key == &metaplex_token_metadata::ID)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

// Access control modifiers
fn user(pool_loader: &AccountLoader<UserPool>, user: &AccountInfo) -> Result<()> {
    let user_pool = pool_loader.load()?;
    require!(user_pool.owner == *user.key, StakingError::InvalidUserPool);
    Ok(())
}