use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::*;

#[account]
#[derive(Default)]
pub struct GlobalPool {
    pub super_admin: Pubkey,     // 32
    pub total_staked_count: u64, // 8
}

#[zero_copy]
#[derive(Default, PartialEq)]
#[repr(packed)]
pub struct StakedData {
    pub mint: Pubkey,      // 32
    pub staked_time: i64,  // 8
    pub tier: u64,         // 8
    pub is_legendary: u64, // 8
}

#[account(zero_copy)]
pub struct UserPool {
    // 8 + 5680
    pub owner: Pubkey,                               // 32
    pub staked_count: u64,                           // 8
    pub staked_mints: [StakedData; STAKE_MAX_COUNT], // 56 * 100
    pub tier1_staked_count: u64,                     // 8
    pub tier2_staked_count: u64,                     // 8
    pub tier3_staked_count: u64,                     // 8
    pub last_reward_time: i64,                       // 8
    pub remaining_rewards: u64,                      // 8
}

impl Default for UserPool {
    #[inline]
    fn default() -> UserPool {
        UserPool {
            owner: Pubkey::default(),
            tier1_staked_count: 0,
            tier2_staked_count: 0,
            tier3_staked_count: 0,
            staked_count: 0,
            staked_mints: [StakedData {
                ..Default::default()
            }; STAKE_MAX_COUNT],
            last_reward_time: 0,
            remaining_rewards: 0,
        }
    }
}

impl UserPool {
    pub fn add_nft(&mut self, nft_pubkey: Pubkey, is_legendary: u8, tier: u8, now: i64) {
        let idx = self.staked_count as usize;
        self.staked_mints[idx].mint = nft_pubkey;
        self.staked_mints[idx].is_legendary = is_legendary as u64;
        self.staked_mints[idx].tier = tier as u64;
        self.staked_mints[idx].staked_time = now;
        self.staked_count += 1;
        match tier {
            1 => {
                self.tier1_staked_count += 1;
            }
            2 => {
                self.tier2_staked_count += 1;
            }
            _ => {
                self.tier3_staked_count += 1;
            }
        }
    }

    pub fn remove_nft(&mut self, nft_pubkey: Pubkey, now: i64) -> Result<u64> {
        let mut withdrawn: u8 = 0;
        let mut index: usize = 0;
        // Find NFT in pool
        for i in 0..self.staked_count {
            let idx = i as usize;
            if self.staked_mints[idx].mint.eq(&nft_pubkey) {
                index = idx;
                withdrawn = 1;
                break;
            }
        }
        require!(withdrawn == 1, StakingError::InvalidNFTAddress);

        // Calculate withdrawing NFT's reward
        let mut last_reward_time: i64 = self.last_reward_time;
        let mut factor: u64 = 100;
        let mut reward_amount: u64 = NORMAL_REWARD_AMOUNT;
        if last_reward_time < self.staked_mints[index].staked_time {
            last_reward_time = self.staked_mints[index].staked_time;
        }
        if self.staked_mints[index].is_legendary == 1 {
            // reward for legendary NFT
            reward_amount = LEGENDARY_REWARD_AMOUNT;
        } else if self.staked_mints[index].is_legendary == 3 {
            // reward for upgraded normal NFT
            reward_amount = NORMAL_REWARD_AMOUNT * 2;
        } else if self.staked_mints[index].is_legendary == 4 {
            // reward for upgraded legendary NFT
            reward_amount = LEGENDARY_REWARD_AMOUNT * 2;
        }

        match self.staked_mints[index].tier {
            1 => {
                if self.tier1_staked_count > 2 {
                    factor = FACTOR;
                }
                factor *= TIER1_FACTOR;
                self.tier1_staked_count -= 1;
            }
            2 => {
                if self.tier2_staked_count > 2 {
                    factor = FACTOR;
                }
                factor *= TIER2_FACTOR;
                self.tier2_staked_count -= 1;
            }
            _ => {
                if self.tier3_staked_count > 2 {
                    factor = FACTOR;
                }
                factor *= TIER3_FACTOR;
                self.tier3_staked_count -= 1;
            }
        }

        let reward =
            (((now - last_reward_time) / EPOCH) as u64) * reward_amount * factor / 10000 as u64;
        self.remaining_rewards += reward;

        // Remove NFT from pool
        let last_idx: usize = (self.staked_count - 1) as usize;
        if index != last_idx {
            self.staked_mints[index] = self.staked_mints[last_idx];
            // self.staked_mints[index].is_legendary = self.staked_mints[last_idx].is_legendary;
            // self.staked_mints[index].staked_time = self.staked_mints[last_idx].staked_time;
        }
        self.staked_count -= 1;
        Ok(reward)
    }
    pub fn claim_reward(&mut self, now: i64) -> Result<u64> {
        let mut total_reward: u64 = 0;
        msg!("Now: {:?} Last_Reward_Time: {}", now, self.last_reward_time);
        // Update Tier counts in pool
        if self.staked_count
            != self.tier1_staked_count + self.tier2_staked_count + self.tier3_staked_count
        {
            self.tier1_staked_count = 0;
            self.tier2_staked_count = 0;
            self.tier3_staked_count = 0;
            for i in 0..self.staked_count {
                let idx = i as usize;
                match self.staked_mints[idx].tier {
                    1 => {
                        self.tier1_staked_count += 1;
                    }
                    2 => {
                        self.tier2_staked_count += 1;
                    }
                    _ => {
                        self.tier3_staked_count += 1;
                    }
                }
            }
        }
        for i in 0..self.staked_count {
            let index = i as usize;
            let mut last_reward_time = self.last_reward_time;
            if last_reward_time < self.staked_mints[index].staked_time {
                last_reward_time = self.staked_mints[index].staked_time;
            }

            let mut factor: u64 = 100;
            let mut reward_amount: u64 = NORMAL_REWARD_AMOUNT;
            if self.staked_mints[index].is_legendary == 1 {
                // reward for legendary NFT
                reward_amount = LEGENDARY_REWARD_AMOUNT;
            } else if self.staked_mints[index].is_legendary == 3 {
                // reward for upgraded normal NFT
                reward_amount = NORMAL_REWARD_AMOUNT * 2;
            } else if self.staked_mints[index].is_legendary == 4 {
                // reward for upgraded legendary NFT
                reward_amount = LEGENDARY_REWARD_AMOUNT * 2;
            }

            match self.staked_mints[index].tier {
                1 => {
                    if self.tier1_staked_count > 2 {
                        factor = FACTOR;
                    }
                    factor *= TIER1_FACTOR;
                }
                2 => {
                    if self.tier2_staked_count > 2 {
                        factor = FACTOR;
                    }
                    factor *= TIER2_FACTOR;
                }
                _ => {
                    if self.tier3_staked_count > 2 {
                        factor = FACTOR;
                    }
                    factor *= TIER3_FACTOR;
                }
            }
            let reward: u64 =
                (((now - last_reward_time) / EPOCH) as u64) * reward_amount * factor / 10000 as u64;

            total_reward += reward;
        }
        total_reward += self.remaining_rewards;
        self.last_reward_time = now;
        self.remaining_rewards = 0;
        Ok(total_reward)
    }

    pub fn change_mint(&mut self, nft_mint: Pubkey, new_nft_mint: Pubkey) {
        for i in 0..self.staked_count {
            let idx = i as usize;
            if self.staked_mints[idx].mint.eq(&nft_mint) {
                self.staked_mints[idx].mint = new_nft_mint;
                break;
            }
        }
    }

    pub fn change_for_rebirth(&mut self, nft_mint: Pubkey) -> Result<()> {
        for i in 0..self.staked_count {
            let idx = i as usize;
            if self.staked_mints[idx].mint.eq(&nft_mint) {
                // update is_legendary as 3 or 4 for upgraded NFT
                self.staked_mints[idx].is_legendary += 3;
                return Ok(());
            }
        }

        Err(Error::from(StakingError::InvalidNFTAddress))
    }
}
