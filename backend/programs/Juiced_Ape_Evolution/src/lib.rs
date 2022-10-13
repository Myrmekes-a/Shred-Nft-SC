use anchor_lang::{
    prelude::*,
};
use anchor_spl::token::{ self, Token, TokenAccount, Transfer};
use metaplex_token_metadata::{
    instruction::update_metadata_accounts,
    state::{Metadata, MAX_URI_LENGTH},
};
use solana_program::program::{invoke, invoke_signed};
use solana_program::system_instruction;

pub mod account;
pub mod constants;
pub mod error;
pub mod utils;

use account::*;
use constants::*;
use error::*;
use utils::*;

declare_id!("6UGs1n5peX4pYhwRofoDvtVaz8sToP8kByU24576wQt4");

#[program]
pub mod juiced_ape_evolution {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        _bump: u8,
        new_admin: Option<Pubkey>,
        juicing_fee_whey: Option<u64>,
        juicing_fee_sol: Option<u64>,
    ) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;
        if global_authority.super_admin == Pubkey::default() {
            global_authority.super_admin = ctx.accounts.admin.key();
        } else {
            require!(
                global_authority.super_admin == ctx.accounts.admin.key(),
                EvolutionError::InvalidSuperOwner
            );
        }
        if let Some(new_super_admin) = new_admin {
            msg!("Super Admin Changed to {:?}", new_super_admin);
            global_authority.super_admin = new_super_admin;
        }
        if let Some(new_juicing_fee_whey) = juicing_fee_whey {
            msg!("Juicing Whey Fee Changed to {}", new_juicing_fee_whey);
            global_authority.juicing_fee_whey = new_juicing_fee_whey;
        }
        if let Some(new_juicing_fee_sol) = juicing_fee_sol {
            msg!("Juicing SOl Fee Changed to {}", new_juicing_fee_sol);
            global_authority.juicing_fee_sol = new_juicing_fee_sol;
        }

        Ok(())
    }

    pub fn initialize_nft_pool(
        ctx: Context<InitializeNftPool>,
        _bump: u8,
    ) -> Result<()> {
        let nft_pool = &mut ctx.accounts.nft_pool;
        nft_pool.mint = ctx.accounts.nft_mint.key();
        nft_pool.is_paid = false;
        nft_pool.is_juiced = false;
        nft_pool.is_mutable = false;
        msg!("NFT mint pubkey: {:?}", nft_pool.mint);
        Ok(())
    }

    pub fn withdraw_treasury_funds(
        ctx: Context<WithdrawTreasuryFunds>,
        global_bump: u8,
        amount: u64,
    ) -> Result<()> {
        let global_authority = &mut &ctx.accounts.global_authority;
        require!(
            global_authority.super_admin == ctx.accounts.admin.key(),
            EvolutionError::InvalidSuperOwner
        );
        let treasury_account = &mut &ctx.accounts.cost_token_vault;
        require!(
            treasury_account.amount >= amount,
            EvolutionError::InsufficientTreasuryFunds
        );

        let token_program = &mut &ctx.accounts.token_program;
        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];
        let user_cost_token_account = &mut &ctx.accounts.user_cost_token_account;

        let cpi_accounts = Transfer {
            from: treasury_account.to_account_info().clone(),
            to: user_cost_token_account.to_account_info().clone(),
            authority: ctx.accounts.global_authority.to_account_info()
        };
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone().to_account_info(), 
                cpi_accounts, 
                signer
            ),
            amount
        )?;
        msg!("Withdraw Amount: {:?}", amount);
        Ok(())
    }

    pub fn withdraw_sol(
        ctx:Context<WithdrawSol>,
        _global_bump: u8,
        sol_bump: u8,
        sol_amount: u64
    ) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;
        require!(
            global_authority.super_admin == ctx.accounts.admin.key(),
            EvolutionError::InvalidSuperOwner
        );

        let seeds = &[SOL_VAULT_SEED.as_bytes(), &[sol_bump]];
        let signer = &[&seeds[..]];

        invoke_signed(
            &system_instruction::transfer(
                ctx.accounts.sol_vault.key,
                ctx.accounts.admin.key,
                sol_amount,
            ),
            &[
                ctx.accounts.admin.to_account_info().clone(),
                ctx.accounts.sol_vault.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
            signer,
        )?;

        Ok(())
    }

    #[access_control(user(&ctx.accounts.nft_pool, &ctx.accounts.nft_mint))]
    pub fn nft_to_mutable(
        ctx:Context<NftToMutable>,
        global_bump: u8,
        // bootcamp_global_bump: u8,
        _nft_bump: u8,
        new_nft_id: String,
        // cpi_flag: bool
    ) -> Result<()> {
        require!(
            ctx.accounts.nft_pool.is_mutable == false,
            EvolutionError::InvalidMutableRequest
        );
        let mint_metadata = &mut &ctx.accounts.mint_metadata;

        let (metadata, _) = Pubkey::find_program_address(
            &[
                metaplex_token_metadata::state::PREFIX.as_bytes(),
                metaplex_token_metadata::id().as_ref(),
                ctx.accounts.nft_mint.key().as_ref(),
            ],
            &metaplex_token_metadata::id(),
        );
        require!(metadata == mint_metadata.key(), EvolutionError::InvalidMetadata);

        let nft_metadata = Metadata::from_account_info(mint_metadata)?;
        let global_authority = &mut ctx.accounts.global_authority;

        if let Some(creators) = nft_metadata.data.creators {
            require!(
                creators[0].address.to_string() == NFT_COLLECTION,
                EvolutionError::UnkownOrNotAllowedNFTCollection
            );       
        } else {
            return err!(EvolutionError::MetadataCreatorParseError);
        };

        let char_vec: Vec<char> = nft_metadata.data.name.chars().collect();
        let mut num_array = vec![];
        let mut idx = 0;
        let mut index = 10000;
        while idx < char_vec.len() - 1 {
            if char_vec[idx] == '#' {
                index = idx;
            }
            idx += 1;
            if index != 10000 {
                if u32::from(char_vec[idx]) == 0 {
                    break;
                }
                num_array.push(char_vec[idx]);
            }
        }
        
        let old_nft_id: String = num_array.into_iter().map(|i| i.to_string()).collect::<String>();
        require!(
            old_nft_id == new_nft_id,
            EvolutionError::InvalidNftId
        );

        let user_token_account = &mut &ctx.accounts.user_token_account;
        let token_program = &mut &ctx.accounts.token_program;
        let burning_account = &mut &ctx.accounts.burn_account;
        
        let mut cpi_accounts;

        cpi_accounts = Transfer {
            from: user_token_account.to_account_info().clone(),
            to: burning_account.to_account_info().clone(),
            authority: ctx.accounts.owner.to_account_info()
        };
        token::transfer(
            CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
            1
        )?; 

        let nft_vault = &mut &ctx.accounts.nft_vault;
        let new_user_token_account = &mut &ctx.accounts.new_user_token_account;
        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];

        cpi_accounts = Transfer {
            from: nft_vault.to_account_info().clone(),
            to: new_user_token_account.to_account_info().clone(),
            authority: global_authority.to_account_info()
        };
        token::transfer(
            CpiContext::new_with_signer(token_program.clone().to_account_info(), cpi_accounts, signer),
            1
        )?;

        global_authority.total_muted_count += 1;
        ctx.accounts.nft_pool.mutable_status(true);

        Ok(())
    }


    #[access_control(user(&ctx.accounts.nft_pool, &ctx.accounts.nft_mint))]
    pub fn juicing_nft(
        ctx:Context<JuicingNft>,
        _global_bump: u8,
        _sol_bump: u8,
        juice_uri: String,
    ) -> Result<()> {        
        let nft_pool = &mut ctx.accounts.nft_pool;
        msg!("Processing Mint= {:?}", nft_pool.mint);
        
        require!(
            nft_pool.is_paid == false,
            EvolutionError::InvalidJuicingRequest
        );

        let mint_metadata = &mut &ctx.accounts.mint_metadata;
        msg!("Metadata Account= {:?}", ctx.accounts.mint_metadata.key());

        let (metadata, _) = Pubkey::find_program_address(
            &[
                metaplex_token_metadata::state::PREFIX.as_bytes(),
                metaplex_token_metadata::id().as_ref(),
                nft_pool.mint.as_ref(),
            ],
            &metaplex_token_metadata::id(),
        );
        require!(
            metadata == mint_metadata.key(),
            EvolutionError::InvalidMetadata
        );

        let mut nft_metadata = Metadata::from_account_info(mint_metadata)?;

        let update_authority = &mut &ctx.accounts.update_authority;

        msg!("Update Authority= {:?}", update_authority.key());
        require!(
            nft_metadata.update_authority == update_authority.key(),
            EvolutionError::InvalidUpdateAuthority
        );

        let global_authority = &mut ctx.accounts.global_authority;
        let user_cost_token_account = &mut &ctx.accounts.user_cost_token_account;
        require!(
            user_cost_token_account.amount >= global_authority.juicing_fee_whey,
            EvolutionError::InsufficientEvolutionFee
        );
        let cost_token_vault = &mut &ctx.accounts.cost_token_vault;
        let token_program = &mut &ctx.accounts.token_program;
        let token_metadata_program = &mut &ctx.accounts.token_metadata_program;

        invoke(
            &system_instruction::transfer(
                ctx.accounts.owner.key,
                ctx.accounts.sol_vault.key,
                global_authority.juicing_fee_sol * SOL_DECIMAL
            ),
            &[
                ctx.accounts.sol_vault.to_account_info().clone(),
                ctx.accounts.owner.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ]
        )?;

        let cpi_accounts = Transfer {
            from: user_cost_token_account.to_account_info().clone(),
            to: cost_token_vault.to_account_info().clone(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        token::transfer(
            CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
            global_authority.juicing_fee_whey,
        )?;
        nft_pool.get_paid();

        nft_metadata.data.uri = puffed_out_string(&juice_uri, MAX_URI_LENGTH);

        invoke(
            &update_metadata_accounts(
                token_metadata_program.key(),
                mint_metadata.key(),
                update_authority.key(),
                Some(update_authority.key()),
                Some(nft_metadata.data),
                None,
            ),
            &[
                token_metadata_program.to_account_info(),
                mint_metadata.to_account_info().clone(),
                update_authority.to_account_info().clone(),
                ],
            )?;
            
        ctx.accounts.global_authority.total_juiced_count += 1;
        nft_pool.juiced_status(true);
            
        Ok(())
    }

    #[access_control(user(&ctx.accounts.nft_pool, &ctx.accounts.nft_mint))]
    pub fn switching_nft(
        ctx:Context<SwitchToShreddedNft>,
        _global_bump: u8,
        uri: String,
    ) -> Result<()> {
        let nft_pool = &mut ctx.accounts.nft_pool;
        let global_authority = &mut ctx.accounts.global_authority;
        
        if nft_pool.is_juiced == true {
            global_authority.total_juiced_count -= 1;
            nft_pool.juiced_status(false);
        } else {
            global_authority.total_juiced_count += 1;
            nft_pool.juiced_status(true);
        }
        
        msg!("Processing Mint= {:?}", ctx.accounts.nft_mint.key());

        let mint_metadata = &mut &ctx.accounts.mint_metadata;
        msg!("Metadata Account= {:?}", ctx.accounts.mint_metadata.key());

        let(metadata, _) = Pubkey::find_program_address(
            &[
                metaplex_token_metadata::state::PREFIX.as_bytes(),
                metaplex_token_metadata::id().as_ref(),
                ctx.accounts.nft_mint.key().as_ref(),
            ],
            &metaplex_token_metadata::id(),
        );
        require!(
            metadata == mint_metadata.key(),
            EvolutionError::InvalidMetadata
        );

        let mut nft_metadata = Metadata::from_account_info(mint_metadata)?;
        let update_authority = &mut &ctx.accounts.update_authority;

        msg!("Update Authority= {:?}", update_authority.key());
        require!(
            nft_metadata.update_authority == update_authority.key(),
            EvolutionError::InvalidUpdateAuthority
        );
        
                
        let token_metadata_program = &mut &ctx.accounts.token_metadata_program;

        nft_metadata.data.uri = puffed_out_string(&uri, MAX_URI_LENGTH);
        invoke(
            &update_metadata_accounts(
                token_metadata_program.key(),
                mint_metadata.key(),
                update_authority.key(),
                Some(update_authority.key()),
                Some(nft_metadata.data),
                None,
            ),
            &[
                token_metadata_program.to_account_info(),
                mint_metadata.to_account_info().clone(),
                update_authority.to_account_info().clone(),
            ],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        payer = admin,
        space = 8 + 64,
    )]
    pub global_authority: Account<'info, GlobalPool>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]

pub struct InitializeNftPool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,

    #[account(
        init,
        seeds=[NFT_POOL_SEED.as_ref(), nft_mint.key.as_ref()],
        bump,
        payer= owner,
        space= 8 + 35,
    )]
    pub nft_pool: Account<'info, NftPool>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(
    bump: u8, 
)]
pub struct WithdrawTreasuryFunds<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,
    
    #[account(
        mut,
        constraint = user_cost_token_account.mint == COST_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = user_cost_token_account.owner == admin.key(),
    )]
    pub user_cost_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = cost_token_vault.mint == COST_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = cost_token_vault.owner == global_authority.key(),
    )]
    pub cost_token_vault: Box<Account<'info, TokenAccount>>,
   
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(
    bump: u8,
    sol_bump: u8,
)]
pub struct WithdrawSol<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        seeds=[SOL_VAULT_SEED.as_ref()],
        bump=sol_bump
    )]
    
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub sol_vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(
    bump: u8,
    nft_bump: u8,
)]
pub struct NftToMutable<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        seeds=[NFT_POOL_SEED.as_ref(), nft_mint.key.as_ref()],
        bump = nft_bump,
    )]
    pub nft_pool: Account<'info, NftPool>,

    #[account(
        mut,
        constraint = user_token_account.owner == *owner.key,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.owner == *owner.key,
    )]
    pub new_user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = nft_vault.owner == global_authority.key(),
    )]
    pub nft_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub burn_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,

    #[account(constraint = token_metadata_program.key == &metaplex_token_metadata::ID)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(
    bump: u8,
    sol_bump: u8
)]
pub struct JuicingNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,

    #[account(
        mut,
        seeds=[NFT_POOL_SEED.as_ref(), nft_mint.key.as_ref()],
        bump,
    )]
    pub nft_pool: Account<'info, NftPool>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        seeds=[SOL_VAULT_SEED.as_ref()],
        bump=sol_bump
    )]
    
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub sol_vault: AccountInfo<'info>,

    #[account(
        mut,
        constraint = user_cost_token_account.mint == COST_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = user_cost_token_account.owner == owner.key(),
    )]
    pub user_cost_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = cost_token_vault.mint == COST_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = cost_token_vault.owner == global_authority.key(), 
    )]
    pub cost_token_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = mint_metadata.owner == &metaplex_token_metadata::ID,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub update_authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: Program<'info, Token>,

    #[account(
        constraint = token_metadata_program.key == &metaplex_token_metadata::ID
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

}

#[derive(Accounts)]
#[instruction(
    bump: u8,
)]
pub struct SwitchToShreddedNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,

    #[account(
        mut,
        seeds=[NFT_POOL_SEED.as_ref(), nft_mint.key.as_ref()],
        bump,
    )]
    pub nft_pool: Account<'info, NftPool>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        constraint = mint_metadata.owner == &metaplex_token_metadata::ID
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub update_authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: Program<'info, Token>,
    // the token metadata program
    #[account(constraint = token_metadata_program.key == &metaplex_token_metadata::ID)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,
}

fn user(pool_loader: &Account<NftPool>, mint: &AccountInfo) -> Result<()> {
    let nft_pool = pool_loader;
    require!(
        nft_pool.mint == *mint.key,
        EvolutionError::InvalidUserPool
    );
    Ok(())
}