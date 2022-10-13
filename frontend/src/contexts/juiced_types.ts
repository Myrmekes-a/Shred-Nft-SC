import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export interface GlobalPool {
  superAdmin: PublicKey; // 32
  juicingFee: anchor.BN; // 8
  totalJuicedCount: anchor.BN; // 8
}

export interface NftPool {
  mint: PublicKey; //32
  isPaid: boolean; //1
  isJuiced: boolean; //1
}
