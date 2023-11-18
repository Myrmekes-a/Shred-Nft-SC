use anchor_lang::{
    prelude::*,
};
use anchor_spl::token::{ self, Token, TokenAccount, Transfer, Mint};
use mpl_token_metadata::{
    instruction::update_metadata_accounts_v2,
    state::{Metadata, MAX_URI_LENGTH, TokenMetadataAccount},
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
    use mpl_token_metadata::state::DataV2;

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

    pub fn initialize_user_pool(
        ctx: Context<InitializeUserPool>,
        _bump: u8,
    ) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        user_pool.owner = ctx.accounts.owner.key();
        user_pool.juiced_count = 0;
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

    pub fn manual_withdraw(
        ctx: Context<ManualWithdraw>,
        global_bump: u8,
    ) -> Result<()> {
        let global_authority = &mut &ctx.accounts.global_authority;
        require!(
            global_authority.super_admin == ctx.accounts.admin.key(),
            EvolutionError::InvalidSuperOwner
        );

        let token_program = &mut &ctx.accounts.token_program;
        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info().clone(),
            to: ctx.accounts.user_token_account.to_account_info().clone(),
            authority: ctx.accounts.global_authority.to_account_info()
        };
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone().to_account_info(), 
                cpi_accounts, 
                signer
            ),
            1
        )?;

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

    #[access_control(user(&ctx.accounts.nft_pool, &ctx.accounts.nft_mint.key))]
    pub fn nft_to_mutable(
        ctx:Context<NftToMutable>,
        global_bump: u8,
        _nft_bump: u8,
        new_nft_id: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.nft_pool.is_mutable == false,
            EvolutionError::InvalidMutableRequest
        );
        let mint_metadata = &mut &ctx.accounts.mint_metadata;

        let (metadata, _) = Pubkey::find_program_address(
            &[
                mpl_token_metadata::state::PREFIX.as_bytes(),
                mpl_token_metadata::id().as_ref(),
                ctx.accounts.nft_mint.key().as_ref(),
            ],
            &mpl_token_metadata::id(),
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


    pub fn juicing_nft(
        ctx:Context<JuicingNft>,
        rebirth_uri: String,
    ) -> Result<()> {        
        let user_pool = &mut ctx.accounts.user_pool;
        let nft_pool = &mut ctx.accounts.nft_pool;
        let global_authority = &mut ctx.accounts.global_authority;
        msg!("Processing Mint= {:?}", nft_pool.mint);
        
        require!(
            user_pool.owner == ctx.accounts.owner.key(),
            EvolutionError::InvalidUserPool
        );  
        require!(
            nft_pool.mint == ctx.accounts.nft_mint.key(),
            EvolutionError::InvalidNftPool
        );  
        require!(
            nft_pool.is_paid == false,
            EvolutionError::InvalidJuicingRequest
        );

        let mint_metadata = &mut &ctx.accounts.mint_metadata;
        msg!("Metadata Account= {:?}", ctx.accounts.mint_metadata.key());

        let (metadata, _) = Pubkey::find_program_address(
            &[
                mpl_token_metadata::state::PREFIX.as_bytes(),
                mpl_token_metadata::id().as_ref(),
                nft_pool.mint.as_ref(),
            ],
            &mpl_token_metadata::id(),
        );
        require!(
            metadata == mint_metadata.key(),
            EvolutionError::InvalidMetadata
        );

        let mut nft_metadata = Metadata::from_account_info(mint_metadata)?;

        let update_authority = &ctx.accounts.update_authority;

        if let Some(creators) = &nft_metadata.data.creators {
            require!(
                creators[0].address.to_string() == GENESIS_COLLECTION,
                EvolutionError::UnkownOrNotAllowedNFTCollection
            );       
        } else {
            return err!(EvolutionError::MetadataCreatorParseError);
        };

        msg!("Update Authority= {:?}", update_authority.key());
        require!(
            nft_metadata.update_authority == update_authority.key(),
            EvolutionError::InvalidUpdateAuthority
        );

        // let user_cost_token_account = &mut &ctx.accounts.user_cost_token_account;
        // require!(
        //     user_cost_token_account.amount >= global_authority.juicing_fee_whey,
        //     EvolutionError::InsufficientEvolutionFee
        // );
        // let cost_token_vault = &mut &ctx.accounts.cost_token_vault;
        // let token_program = &mut &ctx.accounts.token_program;
        let token_metadata_program = &ctx.accounts.token_metadata_program;
        let mut price = 3 * SOL_DECIMAL / 10;
        if user_pool.juiced_count > 1 {
            price = 25 * SOL_DECIMAL / 100;
        }
        if user_pool.juiced_count > 4 {
            price = 2 * SOL_DECIMAL / 10;
        }
        if user_pool.juiced_count > 10 {
            price = 175 * SOL_DECIMAL / 1000;
        }
        if user_pool.juiced_count > 22 {
            price = 15 * SOL_DECIMAL / 100;
        }

        invoke(
            &system_instruction::transfer(
                ctx.accounts.payer.key,
                ctx.accounts.sol_vault.key,
                price,
            ),
            &[
                ctx.accounts.sol_vault.to_account_info().clone(),
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ]
        )?;

        // let cpi_accounts = Transfer {
        //     from: user_cost_token_account.to_account_info().clone(),
        //     to: cost_token_vault.to_account_info().clone(),
        //     authority: ctx.accounts.owner.to_account_info(),
        // };
        // token::transfer(
        //     CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
        //     global_authority.juicing_fee_whey,
        // )?;
        nft_pool.get_paid();

        nft_metadata.data.uri = puffed_out_string(&rebirth_uri, MAX_URI_LENGTH);

        let data_v2: DataV2 = DataV2 {
            name: nft_metadata.data.name,
            symbol: nft_metadata.data.symbol,
            uri: nft_metadata.data.uri,
            seller_fee_basis_points: nft_metadata.data.seller_fee_basis_points,
            creators: nft_metadata.data.creators,
            collection: nft_metadata.collection,
            uses: nft_metadata.uses
        };

        invoke(
            &update_metadata_accounts_v2(
                token_metadata_program.key(),
                mint_metadata.key(),
                update_authority.key(),
                Some(update_authority.key()),
                Some(data_v2),
                None,
                None,
            ),
            &[
                token_metadata_program.to_account_info(),
                mint_metadata.to_account_info().clone(),
                update_authority.to_account_info().clone(),
                ],
            )?;
            
        global_authority.total_juiced_count += 1;
        user_pool.juiced_count += 1;
        nft_pool.juiced_status(true);
            
        Ok(())
    }

    pub fn switching_nft(
        ctx:Context<SwitchToShreddedNft>,
        genesis_uri: String,
        rebirth_uri: String,
    ) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        let nft_pool = &mut ctx.accounts.nft_pool;
        let global_authority = &mut ctx.accounts.global_authority;
        
        require!(
            user_pool.owner == ctx.accounts.owner.key(),
            EvolutionError::InvalidUserPool
        );
        require!(
            nft_pool.mint == ctx.accounts.nft_mint.key(),
            EvolutionError::InvalidNftPool
        );

        let uri: String;
        if nft_pool.is_juiced == true {
            global_authority.total_juiced_count -= 1;
            uri = genesis_uri;
            nft_pool.juiced_status(false);
        } else {
            global_authority.total_juiced_count += 1;
            uri = rebirth_uri;
            nft_pool.juiced_status(true);
        }
        
        msg!("Processing Mint= {:?}", ctx.accounts.nft_mint.key());

        let mint_metadata = &mut &ctx.accounts.mint_metadata;
        msg!("Metadata Account= {:?}", ctx.accounts.mint_metadata.key());

        let(metadata, _) = Pubkey::find_program_address(
            &[
                mpl_token_metadata::state::PREFIX.as_bytes(),
                mpl_token_metadata::id().as_ref(),
                ctx.accounts.nft_mint.key().as_ref(),
            ],
            &mpl_token_metadata::id(),
        );
        require!(
            metadata == mint_metadata.key(),
            EvolutionError::InvalidMetadata
        );

        let mut nft_metadata = Metadata::from_account_info(mint_metadata)?;
        let update_authority = &ctx.accounts.update_authority;

        msg!("Update Authority= {:?}", update_authority.key());
        require!(
            nft_metadata.update_authority == update_authority.key(),
            EvolutionError::InvalidUpdateAuthority
        );
        
                
        let token_metadata_program = &ctx.accounts.token_metadata_program;

        nft_metadata.data.uri = puffed_out_string(&uri, MAX_URI_LENGTH);
        
        let data_v2: DataV2 = DataV2 {
            name: nft_metadata.data.name,
            symbol: nft_metadata.data.symbol,
            uri: nft_metadata.data.uri,
            seller_fee_basis_points: nft_metadata.data.seller_fee_basis_points,
            creators: nft_metadata.data.creators,
            collection: nft_metadata.collection,
            uses: nft_metadata.uses
        };

        invoke(
            &update_metadata_accounts_v2(
                token_metadata_program.key(),
                mint_metadata.key(),
                update_authority.key(),
                Some(update_authority.key()),
                Some(data_v2),
                None,
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
#[instruction(bump: u8)]

pub struct InitializeUserPool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds=[USER_POOL_SEED.as_ref(), owner.key.as_ref()],
        bump,
        space = 8 + 40,
        payer = owner,
    )]
    pub user_pool: Box<Account<'info, UserPool>>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(
    bump: u8, 
)]
pub struct ManualWithdraw<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,

    pub nft_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint = user_token_account.mint == nft_mint.key(),
        constraint = user_token_account.owner == admin.key(),
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_token_account.mint == nft_mint.key(),
        constraint = vault_token_account.owner == global_authority.key(),
    )]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,
   
    pub token_program: Program<'info, Token>,
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

    #[account(constraint = token_metadata_program.key == &mpl_token_metadata::ID)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct JuicingNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds=[USER_POOL_SEED.as_ref(), owner.key.as_ref()],
        bump,
    )]
    pub user_pool: Box<Account<'info, UserPool>>,

    pub nft_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds=[NFT_POOL_SEED.as_ref(), nft_mint.to_account_info().key.as_ref()],
        bump,
    )]
    pub nft_pool: Box<Account<'info, NftPool>>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        seeds=[SOL_VAULT_SEED.as_ref()],
        bump,
    )]
        /// CHECK: This is not dangerous because we don't read or write from this account
    pub sol_vault: AccountInfo<'info>,

    // #[account(
    //     mut,
    //     constraint = user_cost_token_account.mint == COST_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
    //     constraint = user_cost_token_account.owner == owner.key(),
    // )]
    // pub user_cost_token_account: Account<'info, TokenAccount>,

    // #[account(
    //     mut,
    //     constraint = cost_token_vault.mint == COST_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
    //     constraint = cost_token_vault.owner == global_authority.key(), 
    // )]
    // pub cost_token_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = mint_metadata.owner == &mpl_token_metadata::ID,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,

    pub update_authority: Signer<'info>,

    // pub token_program: Program<'info, Token>,

    #[account(
        constraint = token_metadata_program.key == &mpl_token_metadata::ID
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwitchToShreddedNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds=[USER_POOL_SEED.as_ref(), owner.key.as_ref()],
        bump,
    )]
    pub user_pool: Box<Account<'info, UserPool>>,

    pub nft_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds=[NFT_POOL_SEED.as_ref(), nft_mint.to_account_info().key.as_ref()],
        bump,
    )]
    pub nft_pool: Box<Account<'info, NftPool>>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        constraint = mint_metadata.owner == &mpl_token_metadata::ID
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,

    pub update_authority: Signer<'info>,

    #[account(
        constraint = token_metadata_program.key == &mpl_token_metadata::ID
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,
}

fn user(pool_loader: &Account<NftPool>, mint_key: &Pubkey) -> Result<()> {
    let nft_pool = pool_loader;
    require!(
        nft_pool.mint == *mint_key,
        EvolutionError::InvalidUserPool
    );
    Ok(())
}