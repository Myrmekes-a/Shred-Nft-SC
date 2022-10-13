import * as anchor from '@project-serum/anchor';
import {PublicKey} from '@solana/web3.js';

export interface GlobalPool {
    superAdmin: PublicKey,    // 32
    totalStakedCount: anchor.BN,  // 8
}

export interface StakedData {
    mint: PublicKey,         // 32
    stakedTime: anchor.BN,   // 8
    tier: anchor.BN,  // 8
    isLegendary: anchor.BN,  // 8
}

export interface UserPool {
    // 8 + 5680
    owner: PublicKey,            // 32
    stakedCount: anchor.BN,      // 8
    stakedMints: StakedData[],   // 56 * 100
    tier1StakedCount: anchor.BN,      // 8
    tier2StakedCount: anchor.BN,      // 8
    tier3StakedCount: anchor.BN,      // 8
    lastRewardTime: anchor.BN,                         // 8
    remainingRewards: anchor.BN,                       // 8
}
