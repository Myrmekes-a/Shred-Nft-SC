import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export interface GlobalPool {
  superAdmin: PublicKey; // 32
  juicingFeeWhey: anchor.BN; // 8
  juicingFeeSol: anchor.BN; // 8
  totalJuicedCount: anchor.BN; // 8
  totalMutedCount: anchor.BN; // 8
}

export interface NftPool {
  // 8 + 35
  mint: PublicKey; // 32
  isPaid: number; // 1
  isJuiced: number; // 1
  isMutable: number; // 1
}

export interface UserPool {
  // 8 + 40
  owner: PublicKey; // 32
  juicedCount: anchor.BN; // 8
}
