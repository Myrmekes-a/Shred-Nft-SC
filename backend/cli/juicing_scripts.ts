import { Program, web3 } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { programs } from "@metaplex/js";

import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  AccountLayout,
  MintLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import fs from "fs";
import bs58 from "bs58";
import path from "path";
import { GlobalPool, NftPool, UserPool } from "./juicing_types";

export const METAPLEX = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const USER_POOL_SIZE = 5688; // 8 + 5680
const GLOBAL_AUTHORITY_SEED = "global-authority";

const BURN_WALLET_ADDRESS = new PublicKey(
  "4XX1K7KWAM4KrNovEPazunXEiLNvdcyTp1abs8Snz5Ug"
);
// const REWARD_TOKEN_MINT = new PublicKey("CFt8zQNRUpK4Lxhgv64JgZ5giZ3VWXSceQr6yKh7VoFU");
const REWARD_TOKEN_MINT = new PublicKey(
  "Ue4yjkPjA4QGis37eWbBsnqfzyK83BtY4AioDETp3Ab"
);
const PROGRAM_ID = "CTniA9cmfobHRaTq8cBawE9Z9VwYAA1ifgRXMGZxVRfc";
// GlobalAuthority:  FeV6rLhiGSjTns8c9MEF4qkAQLcvzPVeEabYCskCNYQN
// RewardVault:  2Ni6PuHDDt6DUVTr26u1oCpmTvi8Htf9Fn95CarpH144

let rewardVault: PublicKey = null;
let program: Program = null;
let juicingProgram: Program = null;
let provider: anchor.Provider = null;

// Configure the client to use the local cluster.
const updateAuthorityKeypair = Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(
      fs.readFileSync(path.resolve("/root/fury/shred-vault.json"), "utf-8")
    )
  ),
  { skipValidation: true }
);

const idl = JSON.parse(
  fs.readFileSync(__dirname + "/../target/idl/shred_bootcamp.json", "utf8")
);

// Address of the deployed program.
const programId = new anchor.web3.PublicKey(PROGRAM_ID);

anchor.setProvider(
  anchor.AnchorProvider.local(
    "https://lively-proud-moon.solana-mainnet.quiknode.pro/d490b49f6c8766e41845a1f7a0315adcb9d1ea6c/"
  )
); //web3.clusterApiUrl("devnet")));
provider = anchor.getProvider();
const solConnection = anchor.getProvider().connection;
const payer = anchor.AnchorProvider.local().wallet;

// Generate the program client from IDL.
program = new anchor.Program(idl, programId);
const DECIMALS = 1_000_000;
const EPOCH = 1; // 86400 - 1 day
const FACTOR = 125; // X 1.25 Reward
const TIER1_FACTOR = 150; // X 1.5 Reward
const TIER2_FACTOR = 175; // X 1.75 Reward
const TIER3_FACTOR = 200; // X 2.0 Reward
const NORMAL_REWARD_AMOUNT = 116; // 10 $WHEY
const LEGENDARY_REWARD_AMOUNT = 289; // 25 $WHEY

const JUICING_PROGRAM_ID = "6UGs1n5peX4pYhwRofoDvtVaz8sToP8kByU24576wQt4";
const juicingIdl = JSON.parse(
  fs.readFileSync(
    __dirname + "/../target/idl/juiced_ape_evolution.json",
    "utf8"
  )
);
const juicingProgramId = new anchor.web3.PublicKey(JUICING_PROGRAM_ID);
juicingProgram = new anchor.Program(juicingIdl, juicingProgramId);
console.log("JuicingProgramId: ", juicingProgramId.toBase58());

const TEST_MINT_PUBKEY = new PublicKey(
  "q84f7pisNEbRXheHrJ42VKihZY9xZBDo6ZmYTZ8WJ6v"
);
const JUICING_GLOBAL_AUTHORITY_SEED = "juicing-global-authority";
const NFT_POOL_SEED = "juicing-nft-pool";
const SOL_VAULT_SEED = "sol-vault";
const USER_POOL_SEED = "user-pool";
const BURN_PUBKEY = new PublicKey(
  "4XX1K7KWAM4KrNovEPazunXEiLNvdcyTp1abs8Snz5Ug"
);

const main = async () => {
  // let b = bs58.decode('privatekeyexportedfromphantom');
  // let j = new Uint8Array(b.buffer, b.byteOffset, b.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  // fs.writeFileSync('key.json', `[${j}]`);
  // return;
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgram.programId
  );
  console.log("GlobalAuthority: ", globalAuthority.toBase58());

  rewardVault = await getAssociatedTokenAccount(
    globalAuthority,
    REWARD_TOKEN_MINT
  );

  console.log("TreasuryVault: ", rewardVault.toBase58());

  // await initProject();

  const globalPool: GlobalPool = await getGlobalState();
  console.log("globalPool =", globalPool.superAdmin.toBase58());

  // await initUserPool(payer.publicKey);
  // await initNftPool(new PublicKey("CGt2VquBba9shqbzCMfYkzpWF2kwBYDFQXJXayV4TtFt"));
  // await stakeNft(payer.publicKey, new PublicKey('DjuU7P74S2oDtDqLqFDBSnnvR9aqasQFMP3YN6ReeovX'), false, 1);
  // await withdrawNft(payer.publicKey, new PublicKey('D8c3sRRgryP5iaaqKLkaE7Gv3NQGYFdMzkkdxrfBz7n'));
  // await claimReward(payer.publicKey);
  // await manualWithdraw(
  //   new PublicKey("13xvSRjA93rs4ENDFrvu7HH6gM3d6sLCKanxD6vCKGgd")
  // );

  // const stakedInfo = await getStakedNFTsFromWallet(new PublicKey('FjFAr6J3CUeni9Ssse4fELdCV8Q4cBuSNwkU2xVPp5T7'));
  // console.log(stakedInfo);
  // const userPool: UserPool = await getUserPoolState(payer.publicKey);
  // console.log(userPool.owner.toBase58());
  // console.log(userPool.juicedCount.toNumber());
  // console.log({
  //     owner: userPool.owner.toBase58(),
  //     stakedMints: userPool.stakedMints.slice(0, userPool.stakedCount.toNumber()).map((info) => {
  //         return {
  //             mint: info.mint.toBase58(),
  //             stakedTime: info.stakedTime.toNumber(),
  //             isLegendary: info.isLegendary,
  //             tier: info.tier.toNumber(),
  //         }
  //     }),
  //     stakedCount: userPool.stakedCount.toNumber(),
  //     tier1StakedCount: userPool.tier1StakedCount.toNumber(),
  //     tier2StakedCount: userPool.tier2StakedCount.toNumber(),
  //     tier3StakedCount: userPool.tier3StakedCount.toNumber(),
  //     remainingRewards: userPool.remainingRewards.toNumber(),
  //     lastRewardTime: (new Date(1000 * userPool.lastRewardTime.toNumber())).toLocaleString(),
  // });
  // const nftPool: NftPool = await getNftPoolState(
  //   new PublicKey("3c9ciPLu633Sc77JYD2yZnE2dt8LRmKCu1yR1jSEMtGU")
  // );
  // console.log(nftPool.mint.toBase58());
  // console.log("isJuiced", nftPool.isJuiced);
  // console.log("isMutable", nftPool.isMutable);
  // console.log("isPaid", nftPool.isPaid);
  // console.log(await calculateAvailableReward(new PublicKey('FjFAr6J3CUeni9Ssse4fELdCV8Q4cBuSNwkU2xVPp5T7')));
  // await mutNftFromBootcamp(new PublicKey("FjFAr6J3CUeni9Ssse4fELdCV8Q4cBuSNwkU2xVPp5T7"));
  //   await juicingNft(
  //     new PublicKey("4LfWQP8pLeiWEPipw5oCCkkuQYsjd2uyA96fiP2Eu4Tz")
  //   );
  await withdrawSolVault();
};

// export const mutNft = async (
//     nftMint: PublicKey
// ) => {
//     let userAddress = payer.publicKey;
//     console.log("userAddress: ", userAddress.toBase58());

//     const [juicingGlobal, juicingBump] = await PublicKey.findProgramAddress(
//         [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
//         juicingProgramId
//     );

//     console.log("JuicingGlobalAuthority: ", juicingGlobal.toBase58());

//     let userPoolKey = await PublicKey.createWithSeed(
//         userAddress,
//         "user-pool",
//         juicingProgram.programId,
//     );

//     console.log("userPoolKey: ", userPoolKey.toBase58());

//     let poolAccount = await solConnection.getAccountInfo(userPoolKey);
//     if (poolAccount === null || poolAccount.data === null) {
//         console.log("Creating UserPool Account...")
//         await initUserPool(userAddress);
//     }

//     const [nftPoolKey, nftBump] = await PublicKey.findProgramAddress(
//         [Buffer.from(NFT_POOL_SEED), stakedNftMint.toBuffer()],
//         juicingProgramId
//     );

//     console.log("nftPoolKey: ", nftPoolKey.toBase58());
//     let nftPoolAccount = await solConnection.getAccountInfo(nftPoolKey);
//     if (nftPoolAccount === null || nftPoolAccount.data === null) {
//         console.log("Creating NFT Pool...");
//         await initNftPool(stakedNftMint);
//     }
//     let nftAccount = await juicingProgram.account.nftPool.fetch(nftPoolKey);
//     console.log("+++++NFT POOL++++++: ", nftAccount);

//     let userPoolAccount = await getUserPoolState(payer.publicKey);
//     console.log("!!!!!USER POOL!!!!!!!: ", userPoolAccount.stakedMints[1].mint.toBase58());

//     let corresponding = JSON.parse(fs.readFileSync(__dirname + '/./old_to_new.json', 'utf-8'));
//     let newNftMint;

//     for (let i = 0; i < corresponding.length; i++) {
//         if (corresponding[i].oldPubkey == stakedNftMint.toString()) {
//             newNftMint = corresponding[i].newPubkey;
//             break;
//         }
//         continue;
//     }

//     if (newNftMint == undefined) {
//         console.log("No matching NFT");
//         return;
//     }

//     // let stakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, stakedNftMint);
//     let oldNftAta = await getATokenAccountsNeedCreate(
//         solConnection,
//         userAddress,
//         globalAuthority,
//         [stakedNftMint]
//     );
//     console.log("stakedATA", oldNftAta.destinationAccounts[0].toBase58());

//     // let newStakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, new PublicKey(newNftMint));
//     let newNftAta = await getATokenAccountsNeedCreate(
//         solConnection,
//         userAddress,
//         globalAuthority,
//         [new PublicKey(newNftMint)]
//     );
//     console.log("newStakedATA", newNftAta.destinationAccounts[0].toBase58());

//     let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
//         solConnection,
//         userAddress,
//         juicingGlobal,
//         [new PublicKey(newNftMint)]
//     );

//     console.log("NFT Vault", destinationAccounts[0].toBase58());

//     let ret = await getATokenAccountsNeedCreate(
//         solConnection,
//         userAddress,
//         BURN_PUBKEY,
//         [stakedNftMint]
//     );

//     console.log("Burn ATA: ", ret.destinationAccounts[0].toBase58());
//     let newNftAccount = await solConnection.getAccountInfo(destinationAccounts[0]);
//     if (newNftAccount == null) {
//         console.log("No NFT in the NFT Vault!");
//         return;
//     }

//     const oldMetadata = await getMetadata(stakedNftMint);
//     const newMetadata = await getMetadata(new PublicKey(newNftMint));
//     //Another method that can be used to fetch address of the metadata account is as bellows
//     // const metadataAccount = await Metadata.getPDA(new PublicKey(newNftAddress));

//     let {
//         metadata: { Metadata },
//     } = programs;
//     const metadata = await Metadata.load(solConnection, newMetadata);
//     let newNftName = metadata.data.data.name;

//     let idx = newNftName.indexOf('#');
//     if (idx == -1) {
//         console.log("No matching NFT!");
//         return;
//     }

//     let newNftId = newNftName.slice(idx + 1);

//     console.log("New NFT ID: ", newNftId);
//     console.log("Owner: ", userAddress.toBase58());

//     const tx = await juicingProgram.rpc.nftToMutable(
//         globalBump, nftBump, newNftId, {
//         accounts: {
//             owner: userAddress,
//             nftMint: stakedNftMint,
//             globalAuthority: juicingGlobal,
//             nftPool: nftPoolKey,
//             stakedTokenAccount: oldNftAta.destinationAccounts[0],
//             newStakedTokenAccount: newNftAta.destinationAccounts[0],
//             newNftMint: new PublicKey(newNftMint),
//             nftVault: destinationAccounts[0],
//             burnAccount: ret.destinationAccounts[0],
//             juicingProgram: juicingProgramId,
//             mintMetadata: oldMetadata,
//             tokenMetadataProgram: METAPLEX,
//             tokenProgram: TOKEN_PROGRAM_ID,
//         },
//         instructions: [
//             ...instructions,
//             ...ret.instructions,
//             ...oldNftAta.instructions,
//             ...newNftAta.instructions
//         ],
//         signers: [],
//     }
//     );
//     await solConnection.confirmTransaction(tx, "singleGossip");
//     console.log("Your transaction signature", tx);

// }

// export const getStakedNFTsFromWallet = async (address: PublicKey) => {
//     const [globalAuthority, bump] = await PublicKey.findProgramAddress(
//         [Buffer.from(GLOBAL_AUTHORITY_SEED)],
//         juicingProgram.programId
//     );
//     console.log('GlobalAuthority: ', globalAuthority.toBase58());

//     const userPool: UserPool = await getUserPoolState(address);
//     return {
//         holder: globalAuthority.toBase58(),
//         stakedCount: userPool.stakedCount.toNumber(),
//         stakedMints: userPool.stakedMints.slice(0, userPool.stakedCount.toNumber()).map((info) => {
//             return info.mint.toBase58();
//         })
//     }
// };

export const initProject = async () => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgram.programId
  );
  const tx = await juicingProgram.rpc.initialize(bump, new PublicKey('FRGkXi49T2R8ikz5J4wBCb3mnydPuWGZoyJ9LMFgXxpS'), null, null, {
    accounts: {
      admin: payer.publicKey,
      globalAuthority,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
    signers: [],
  });
  await solConnection.confirmTransaction(tx, "confirmed");

  console.log("txHash =", tx);
  return false;
};

export const withdrawSolVault = async () => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgram.programId
  );
  const [solVault, vault_bump] = await PublicKey.findProgramAddress(
    [Buffer.from(SOL_VAULT_SEED)],
    juicingProgramId
  );
  console.log("SolVault: ", solVault.toBase58());
  const amount =
    (await solConnection.getBalance(solVault)) -
    (await solConnection.getMinimumBalanceForRentExemption(0));
  const tx = await juicingProgram.rpc.withdrawSol(
    bump,
    vault_bump,
    new anchor.BN(amount),
    {
      accounts: {
        admin: payer.publicKey,
        globalAuthority,
        solVault,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    }
  );
  await solConnection.confirmTransaction(tx, "confirmed");

  console.log("txHash =", tx);
  return false;
};

export const initNftPool = async (mint: PublicKey) => {
  const userAddress: PublicKey = payer.publicKey;

  const [nftPoolKey, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), mint.toBuffer()],
    juicingProgramId
  );

  const tx = await juicingProgram.rpc.initializeNftPool(bump, {
    accounts: {
      owner: userAddress,
      nftMint: mint,
      nftPool: nftPoolKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
    signers: [],
  });

  await solConnection.confirmTransaction(tx, "confirmed");

  console.log("Your transaction signature", tx);
};

export const initUserPool = async () => {
  const userAddress = payer.publicKey;

  const [userPoolKey, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(USER_POOL_SEED), userAddress.toBuffer()],
    juicingProgramId
  );

  const tx = await juicingProgram.rpc.initializeUserPool(bump, {
    accounts: {
      owner: userAddress,
      userPool: userPoolKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
    signers: [],
  });

  await solConnection.confirmTransaction(tx, "confirmed");

  console.log("Your transaction signature", tx);
};

export const manualWithdraw = async (nftMint: PublicKey) => {
  let userAddress = payer.publicKey;
  console.log("userAddress: ", userAddress.toBase58());

  const [juicingGlobal, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgramId
  );
  console.log("JuicingGlobalAuthority: ", juicingGlobal.toBase58());

  const vaultTokenAccount = await getAssociatedTokenAccount(
    juicingGlobal,
    nftMint
  );
  const { instructions, destinationAccounts } =
    await getATokenAccountsNeedCreate(solConnection, userAddress, userAddress, [
      nftMint,
    ]);
  console.log("userATA", destinationAccounts[0].toBase58());

  const tx = await juicingProgram.rpc.manualWithdraw(bump, {
    accounts: {
      admin: userAddress,
      globalAuthority: juicingGlobal,
      nftMint,
      userTokenAccount: destinationAccounts[0],
      vaultTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    instructions: [...instructions],
    signers: [],
  });
  await solConnection.confirmTransaction(tx, "confirmed");
  console.log("Your transaction signature", tx);
};

export const juicingNft = async (nftMint: PublicKey) => {
  let userAddress = payer.publicKey;
  console.log("userAddress: ", userAddress.toBase58());

  const [juicingGlobal] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgramId
  );
  console.log("JuicingGlobalAuthority: ", juicingGlobal.toBase58());

  const [solVault] = await PublicKey.findProgramAddress(
    [Buffer.from(SOL_VAULT_SEED)],
    juicingProgramId
  );
  console.log("SolVault: ", solVault.toBase58());

  const [userPoolKey] = await PublicKey.findProgramAddress(
    [Buffer.from(USER_POOL_SEED), userAddress.toBuffer()],
    juicingProgramId
  );
  console.log("User Pool: ", userPoolKey.toBase58());

  let poolAccount = await solConnection.getAccountInfo(userPoolKey);
  if (poolAccount === null || poolAccount.data === null) {
    console.log("Creating UserPool Account...");
    await initUserPool();
  }

  const [nftPoolKey] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), nftMint.toBuffer()],
    juicingProgramId
  );
  console.log("nftPoolKey: ", nftPoolKey.toBase58());

  let nftPoolAccount = await solConnection.getAccountInfo(nftPoolKey);
  if (nftPoolAccount === null || nftPoolAccount.data === null) {
    console.log("Creating NFT Pool...");
    await initNftPool(nftMint);
  }

  let corresponding = JSON.parse(
    fs.readFileSync(__dirname + "/./old_to_new.json", "utf-8")
  );
  let rebirth_uri;
  for (let i = 0; i < corresponding.length; i++) {
    if (corresponding[i].newPubkey == nftMint.toString()) {
      rebirth_uri = corresponding[i].rebirthMetaLink;
      break;
    }
  }
  if (rebirth_uri == undefined) {
    console.log("No matching NFT");
    return;
  }
  console.log("NewMetadataURI:", rebirth_uri);

  // let stakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, stakedNftMint);
  //   let oldNftAta = await getATokenAccountsNeedCreate(
  //     solConnection,
  //     userAddress,
  //     globalAuthority,
  //     [stakedNftMint]
  //   );
  //   console.log("stakedATA", oldNftAta.destinationAccounts[0].toBase58());

  // let newStakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, new PublicKey(newNftMint));
  //   let newNftAta = await getATokenAccountsNeedCreate(
  //     solConnection,
  //     userAddress,
  //     globalAuthority,
  //     [new PublicKey(newNftMint)]
  //   );
  //   console.log("newStakedATA", newNftAta.destinationAccounts[0].toBase58());

  //   let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
  //     solConnection,
  //     userAddress,
  //     juicingGlobal,
  //     [new PublicKey(newNftMint)]
  //   );

  //   console.log("NFT Vault", destinationAccounts[0].toBase58());

  //   let ret = await getATokenAccountsNeedCreate(
  //     solConnection,
  //     userAddress,
  //     BURN_PUBKEY,
  //     [stakedNftMint]
  //   );

  //   console.log("Burn ATA: ", ret.destinationAccounts[0].toBase58());
  //   let newNftAccount = await solConnection.getAccountInfo(
  //     destinationAccounts[0]
  //   );
  //   if (newNftAccount == null) {
  //     console.log("No NFT in the NFT Vault!");
  //     return;
  //   }

  //   const oldMetadata = await getMetadata(stakedNftMint);
  const newMetadata = await getMetadata(new PublicKey(nftMint));
  //Another method that can be used to fetch address of the metadata account is as bellows
  // const metadataAccount = await Metadata.getPDA(new PublicKey(newNftAddress));

  let {
    metadata: { Metadata },
  } = programs;
  const metadata = await Metadata.load(solConnection, newMetadata);
  let newNftName = metadata.data.data.name;

  let idx = newNftName.indexOf("#");
  if (idx == -1) {
    console.log("No matching NFT!");
    return;
  }

  let newNftId = newNftName.slice(idx + 1);

  console.log("New NFT ID: ", newNftId);
  console.log("Owner: ", userAddress.toBase58());

  const tx = await juicingProgram.rpc.juicingNft(rebirth_uri, {
    accounts: {
      payer: userAddress,
      owner: userAddress,
      userPool: userPoolKey,
      nftMint,
      nftPool: nftPoolKey,
      globalAuthority: juicingGlobal,
      solVault,
      //   stakedTokenAccount: oldNftAta.destinationAccounts[0],
      //   newStakedTokenAccount: newNftAta.destinationAccounts[0],
      //   newNftMint: new PublicKey(newNftMint),
      //   nftVault: destinationAccounts[0],
      //   burnAccount: ret.destinationAccounts[0],
      //   juicingProgram: juicingProgramId,
      mintMetadata: newMetadata,
      updateAuthority: updateAuthorityKeypair.publicKey,
      tokenMetadataProgram: METAPLEX,
      systemProgram: SystemProgram.programId,
    },
    instructions: [
      //   ...instructions,
      //   ...ret.instructions,
      //   ...oldNftAta.instructions,
      //   ...newNftAta.instructions,
    ],
    signers: [updateAuthorityKeypair],
  });
  await solConnection.confirmTransaction(tx, "confirmed");
  console.log("Your transaction signature", tx);
};

export const getGlobalState = async (): Promise<GlobalPool | null> => {
  const [globalAuthority] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgram.programId
  );
  try {
    let globalState = await juicingProgram.account.globalPool.fetch(
      globalAuthority
    );
    return globalState as unknown as GlobalPool;
  } catch {
    return null;
  }
};

export const getUserPoolState = async (
  userAddress: PublicKey
): Promise<UserPool | null> => {
  if (!userAddress) return null;

  const [userPoolKey] = await PublicKey.findProgramAddress(
    [Buffer.from(USER_POOL_SEED), userAddress.toBuffer()],
    juicingProgramId
  );
  console.log("User Pool: ", userPoolKey.toBase58());
  try {
    let poolState = await juicingProgram.account.userPool.fetch(userPoolKey);
    return poolState as unknown as UserPool;
  } catch {
    return null;
  }
};

export const getNftPoolState = async (
  nftMint: PublicKey
): Promise<NftPool | null> => {
  if (!nftMint) return null;

  const [nftPoolKey] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), nftMint.toBuffer()],
    juicingProgramId
  );
  console.log("nftPoolKey: ", nftPoolKey.toBase58());

  try {
    let poolState = await juicingProgram.account.nftPool.fetch(nftPoolKey);
    return poolState as unknown as NftPool;
  } catch {
    return null;
  }
};

const getOwnerOfNFT = async (nftMintPk: PublicKey): Promise<PublicKey> => {
  let tokenAccountPK = await getNFTTokenAccount(nftMintPk);
  let tokenAccountInfo = await solConnection.getAccountInfo(tokenAccountPK);

  console.log("nftMintPk=", nftMintPk.toBase58());
  console.log("tokenAccountInfo =", tokenAccountInfo);

  if (tokenAccountInfo && tokenAccountInfo.data) {
    let ownerPubkey = new PublicKey(tokenAccountInfo.data.slice(32, 64));
    console.log("ownerPubkey=", ownerPubkey.toBase58());
    return ownerPubkey;
  }
  return new PublicKey("");
};

const getNFTTokenAccount = async (nftMintPk: PublicKey): Promise<PublicKey> => {
  console.log("getNFTTokenAccount nftMintPk=", nftMintPk.toBase58());
  let tokenAccount = await solConnection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 64,
          bytes: "2",
        },
      },
      {
        memcmp: {
          offset: 0,
          bytes: nftMintPk.toBase58(),
        },
      },
    ],
  });
  return tokenAccount[0].pubkey;
};

const getAssociatedTokenAccount = async (
  ownerPubkey: PublicKey,
  mintPk: PublicKey
): Promise<PublicKey> => {
  let associatedTokenAccountPubkey = (
    await PublicKey.findProgramAddress(
      [
        ownerPubkey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintPk.toBuffer(), // mint address
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
  return associatedTokenAccountPubkey;
};

export const getATokenAccountsNeedCreate = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey,
  nfts: anchor.web3.PublicKey[]
) => {
  let instructions = [],
    destinationAccounts = [];
  for (const mint of nfts) {
    const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
    let response = await connection.getAccountInfo(destinationPubkey);
    if (!response) {
      const createATAIx = createAssociatedTokenAccountInstruction(
        destinationPubkey,
        walletAddress,
        owner,
        mint
      );
      instructions.push(createATAIx);
    }
    destinationAccounts.push(destinationPubkey);
  }
  return {
    instructions,
    destinationAccounts,
  };
};

export const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
};

/** Get metaplex mint metadata account address */
export const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from("metadata"), METAPLEX.toBuffer(), mint.toBuffer()],
      METAPLEX
    )
  )[0];
};

main();
