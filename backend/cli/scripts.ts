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
import { GlobalPool, UserPool } from "./types";
import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";

export const METAPLEX = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const USER_POOL_SIZE = 5688; // 8 + 5680
const STAKING_USER_POOL_SIZE = 4864; // 8 + 4856
const GLOBAL_AUTHORITY_SEED = "global-authority";

const BURN_WALLET_ADDRESS = new PublicKey(
  "4XX1K7KWAM4KrNovEPazunXEiLNvdcyTp1abs8Snz5Ug"
);
// const REWARD_TOKEN_MINT = new PublicKey("CFt8zQNRUpK4Lxhgv64JgZ5giZ3VWXSceQr6yKh7VoFU");
const REWARD_TOKEN_MINT = new PublicKey(
  "Ue4yjkPjA4QGis37eWbBsnqfzyK83BtY4AioDETp3Ab"
);
// const PROGRAM_ID = "CTniA9cmfobHRaTq8cBawE9Z9VwYAA1ifgRXMGZxVRfc";
const PROGRAM_ID = "5Q5FXSHTABC4URi6KUxT9auirRxo86GukRAYBK7Jweo4";
// GlobalAuthority:  FeV6rLhiGSjTns8c9MEF4qkAQLcvzPVeEabYCskCNYQN
// RewardVault:  2Ni6PuHDDt6DUVTr26u1oCpmTvi8Htf9Fn95CarpH144

let rewardVault: PublicKey = null;
let program: Program = null;
let juicingProgram: Program = null;
let provider: anchor.Provider = null;

// Configure the client to use the local cluster.
// const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("/home/fury/.config/solana/id.json"), 'utf-8'))), { skipValidation: true });

const idl = JSON.parse(
  fs.readFileSync(__dirname + "/../target/idl/shred_bootcamp.json", "utf8")
);

const stakingIdl = JSON.parse(
  fs.readFileSync(__dirname + "/../target/idl/shred_staking.json", "utf8")
);

// Address of the deployed program.
const programId = new anchor.web3.PublicKey(PROGRAM_ID);

anchor.setProvider(
  anchor.AnchorProvider.local(
    "https://nameless-cool-hill.solana-mainnet.quiknode.pro/8573940e7f293a749e9775b61efc3814c9ff25eb/"
  )
); //web3.clusterApiUrl("devnet")));
provider = anchor.getProvider();
const solConnection = anchor.getProvider().connection;
const payer = anchor.AnchorProvider.local().wallet;

// Generate the program client from IDL.
program = new anchor.Program(idl, programId);
console.log("ProgramId: ", program.programId.toBase58());
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
juicingProgram = new anchor.Program(stakingIdl, juicingProgramId);

const TEST_MINT_PUBKEY = new PublicKey(
  "q84f7pisNEbRXheHrJ42VKihZY9xZBDo6ZmYTZ8WJ6v"
);
const JUICING_GLOBAL_AUTHORITY_SEED = "juicing-global-authority";
const NFT_POOL_SEED = "juicing-nft-pool";
const BURN_PUBKEY = new PublicKey(
  "4XX1K7KWAM4KrNovEPazunXEiLNvdcyTp1abs8Snz5Ug"
);

const main = async () => {
  // let b = bs58.decode('privatekeyexportedfromphantom');
  // let j = new Uint8Array(b.buffer, b.byteOffset, b.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  // fs.writeFileSync('key.json', `[${j}]`);
  // return;
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("GlobalAuthority: ", globalAuthority.toBase58());

  rewardVault = await getAssociatedTokenAccount(
    globalAuthority,
    REWARD_TOKEN_MINT
  );

  console.log("RewardVault: ", rewardVault.toBase58());

  // await initProject();

  const globalPool: GlobalPool = await getGlobalState();
  console.log(
    "globalPool =",
    globalPool.superAdmin.toBase58(),
    globalPool.totalStakedCount.toNumber()
  );

  // await initUserPool(
  //   new PublicKey('9Z4MUHNNP46ABnqiEQ2xqTrwPKzZRsDPY5X4FSHzCVr')
  // );
  // await initNftPool(new PublicKey("CGt2VquBba9shqbzCMfYkzpWF2kwBYDFQXJXayV4TtFt"));
  // await stakeNft(payer.publicKey, new PublicKey('DjuU7P74S2oDtDqLqFDBSnnvR9aqasQFMP3YN6ReeovX'), false, 1);
  // await withdrawNft(
  //   new PublicKey('Am9xhPPVCfDZFDabcGgmQ8GTMdsbqEt1qVXbyhTxybAp'),
  //   new PublicKey('EUarfUzAStABRZRQTCQbrWLV841nhrfTTGYZputt2MQi')
  // );
  await claimReward(payer.publicKey);
  // await getAllStakers();

  // const stakings = JSON.parse(
  //   fs.readFileSync('./stakings-work.json', { encoding: 'utf8' })
  // );

  // let failedStakings = [];
  // let count = 0;
  // for(let staking of stakings) {
  //   let info = {user: staking.user, nfts: []};
  //   for (let nft of staking.nfts) {
  //     try {
  //       await withdrawNft(new PublicKey(staking.user), new PublicKey(nft));
  //       count++;
  //     } catch(e) {
  //       console.log(staking.user, nft, e?.message);
  //       info.nfts.push(nft);
  //     }
  //   }
  //   if (info.nfts.length > 0) failedStakings.push(info);
  // }

  // console.log("===> Proceed stakings:", count);

  // fs.writeFileSync('./failed-stakings.json', JSON.stringify(failedStakings));

  // let i = 1;
  // let chunks = [];
  // let failedPools = [];
  // for (; i <= pools.length; i++) {
  //   if (i % 10 !== 0 && i !== pools.length) continue;
  //   let stakingInfo = [];
  //   chunks = pools.slice(i / 10 - 1, i);
  //   const res = await Promise.all(
  //     chunks.map(
  //       (pool) =>
  //         new Promise(async (resolve, _) => {
  //           const stakedInfo = await getStakedNFTsFromPool(
  //             new PublicKey(pool)
  //           ).catch((_) => {
  //             failedPools.push(pool);
  //             return undefined;
  //           });
  //           if (stakedInfo && stakedInfo.stakedCount > 0)
  //             stakingInfo.push(stakedInfo);
  //           resolve(stakedInfo);
  //         })
  //     )
  //   );
  //   console.log(i, stakingInfo.length, "---- Awaiting 30s -----");
  //   await new Promise((resolve) => setTimeout(() => resolve(true), 30000));
  //   fs.writeFileSync("./stakings.json", JSON.stringify(stakingInfo));
  // }
  // fs.writeFileSync("./failed-stakings.json", JSON.stringify(failedPools));

  // const stakedInfo = await getStakedNFTsFromWallet(new PublicKey('igY5JmB7X5zqkzJN6qPoWMjxwxmnQdes8TYAotB1M6s'));
  // console.log(stakedInfo);
  // const userPool: UserPool = await getUserPoolState(
  //   new PublicKey("7CAcyNLgejiFxJ2YBGujzKXHWJ5zH2nrtRHShMt7QTRG")
  // );
  // console.log(userPool.owner.toBase58());
  // console.log({
  //   owner: userPool.owner.toBase58(),
  //   stakedMints: userPool.stakedMints
  //     .slice(0, userPool.stakedCount.toNumber())
  //     .map((info) => {
  //       return {
  //         mint: info.mint.toBase58(),
  //         stakedTime: info.stakedTime.toNumber(),
  //         isLegendary: info.isLegendary,
  //         tier: info.tier.toNumber(),
  //       };
  //     }),
  //   stakedCount: userPool.stakedCount.toNumber(),
  //   tier1StakedCount: userPool.tier1StakedCount.toNumber(),
  //   tier2StakedCount: userPool.tier2StakedCount.toNumber(),
  //   tier3StakedCount: userPool.tier3StakedCount.toNumber(),
  //   remainingRewards: userPool.remainingRewards.toNumber(),
  //   lastRewardTime: new Date(
  //     1000 * userPool.lastRewardTime.toNumber()
  //   ).toLocaleString(),
  // });
  // console.log(await calculateAvailableReward(new PublicKey('FjFAr6J3CUeni9Ssse4fELdCV8Q4cBuSNwkU2xVPp5T7')));
  // await mutNftFromBootcamp(new PublicKey("FjFAr6J3CUeni9Ssse4fELdCV8Q4cBuSNwkU2xVPp5T7"));
};

export const mutNftFromBootcamp = async (stakedNftMint: PublicKey) => {
  let userAddress = payer.publicKey;
  console.log("userAddress: ", userAddress.toBase58());

  const [globalAuthority, globalBump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("GlobalAuthority: ", globalAuthority.toBase58());

  const [juicingGlobal, juicingBump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgramId
  );

  console.log("JuicingGlobalAuthority: ", juicingGlobal.toBase58());

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  console.log("userPoolKey: ", userPoolKey.toBase58());

  let poolAccount = await solConnection.getAccountInfo(userPoolKey);
  if (poolAccount === null || poolAccount.data === null) {
    console.log("Creating UserPool Account...");
    await initUserPool(userAddress);
  }

  const [nftPoolKey, nftBump] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), stakedNftMint.toBuffer()],
    juicingProgramId
  );

  console.log("nftPoolKey: ", nftPoolKey.toBase58());
  let nftPoolAccount = await solConnection.getAccountInfo(nftPoolKey);
  if (nftPoolAccount === null || nftPoolAccount.data === null) {
    console.log("Creating NFT Pool...");
    await initNftPool(stakedNftMint);
  }
  let nftAccount = await juicingProgram.account.nftPool.fetch(nftPoolKey);
  console.log("+++++NFT POOL++++++: ", nftAccount);

  let userPoolAccount = await getUserPoolState(payer.publicKey);
  console.log(
    "!!!!!USER POOL!!!!!!!: ",
    userPoolAccount.stakedMints[1].mint.toBase58()
  );

  let corresponding = JSON.parse(
    fs.readFileSync(__dirname + "/./old_to_new.json", "utf-8")
  );
  let newNftMint;

  for (let i = 0; i < corresponding.length; i++) {
    if (corresponding[i].oldPubkey == stakedNftMint.toString()) {
      newNftMint = corresponding[i].newPubkey;
      break;
    }
    continue;
  }

  if (newNftMint == undefined) {
    console.log("No matching NFT");
    return;
  }

  // let stakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, stakedNftMint);
  let oldNftAta = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    globalAuthority,
    [stakedNftMint]
  );
  console.log("stakedATA", oldNftAta.destinationAccounts[0].toBase58());

  // let newStakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, new PublicKey(newNftMint));
  let newNftAta = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    globalAuthority,
    [new PublicKey(newNftMint)]
  );
  console.log("newStakedATA", newNftAta.destinationAccounts[0].toBase58());

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    juicingGlobal,
    [new PublicKey(newNftMint)]
  );

  console.log("NFT Vault", destinationAccounts[0].toBase58());

  let ret = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    BURN_PUBKEY,
    [stakedNftMint]
  );

  console.log("Burn ATA: ", ret.destinationAccounts[0].toBase58());
  let newNftAccount = await solConnection.getAccountInfo(
    destinationAccounts[0]
  );
  if (newNftAccount == null) {
    console.log("No NFT in the NFT Vault!");
    return;
  }

  const oldMetadata = await getMetadata(stakedNftMint);
  const newMetadata = await getMetadata(new PublicKey(newNftMint));
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

  const tx = await program.rpc.mutBootcampNft(
    globalBump,
    juicingBump,
    nftBump,
    newNftId,
    {
      accounts: {
        owner: userAddress,
        userPool: userPoolKey,
        nftMint: stakedNftMint,
        newNftMint: new PublicKey(newNftMint),
        globalAuthority,
        juicingGlobal,
        juicingNftInfo: nftPoolKey,
        stakedTokenAccount: oldNftAta.destinationAccounts[0],
        newStakedTokenAccount: newNftAta.destinationAccounts[0],
        nftVault: destinationAccounts[0],
        burnAccount: ret.destinationAccounts[0],
        juicingProgram: juicingProgramId,
        mintMetadata: oldMetadata,
        tokenMetadataProgram: METAPLEX,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: [
        ...instructions,
        ...ret.instructions,
        ...oldNftAta.instructions,
        ...newNftAta.instructions,
      ],
      signers: [],
    }
  );
  await solConnection.confirmTransaction(tx, "singleGossip");
  console.log("Your transaction signature", tx);
};

export const getStakedNFTsFromPool = async (address: PublicKey) => {
  try {
    let poolState = (await program.account.userPool.fetch(
      address
    )) as unknown as UserPool;
    return {
      holder: poolState.owner.toBase58(),
      stakedCount: poolState.stakedCount.toNumber(),
      stakedMints: poolState.stakedMints
        .slice(0, poolState.stakedCount.toNumber())
        .map((info) => {
          return info.mint.toBase58();
        }),
    };
  } catch {
    return null;
  }
};

export const getStakedNFTsFromWallet = async (address: PublicKey) => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("GlobalAuthority: ", globalAuthority.toBase58());

  const userPool: UserPool = await getUserPoolState(address);
  return {
    holder: globalAuthority.toBase58(),
    stakedCount: userPool.stakedCount.toNumber(),
    stakedMints: userPool.stakedMints
      .slice(0, userPool.stakedCount.toNumber())
      .map((info) => {
        return info.mint.toBase58();
      }),
  };
};

export const initProject = async () => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  // let ix = await getATokenAccountsNeedCreate(
  //     solConnection,
  //     provider.publicKey,
  //     provider.publicKey,
  //     // new PublicKey('H7TcNyyb9BAdQrEHy2TA95hpMhsWW5cp5jkyXpBPS7Uq'),
  //     [new PublicKey('AsSF8RJt6AFNLPm1K1dwZjkK5X8iDr1YZvkXto36GCaj')]
  // );
  // let tx = new Transaction();
  // tx.add(...ix.instructions);
  // console.log("+++++", globalAuthority.toBase58());
  const tx = await program.rpc.initialize(bump, {
    accounts: {
      admin: payer.publicKey,
      globalAuthority,
      rewardVault: rewardVault,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
    signers: [],
  });
  await solConnection.confirmTransaction(tx, "confirmed");
  // const txId = await provider.sendAndConfirm(tx, [], {
  //     commitment: "confirmed",
  // });

  // console.log("txHash =", txId);

  console.log("txHash =", tx);
  return false;
};

export const initNftPool = async (mint: PublicKey) => {
  let userAddress: PublicKey = payer.publicKey;

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

export const initUserPool = async (userAddress: PublicKey) => {
  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  console.log("++++", userPoolKey.toBase58());
  console.log(USER_POOL_SIZE);
  let ix = SystemProgram.createAccountWithSeed({
    fromPubkey: userAddress,
    basePubkey: userAddress,
    seed: "user-pool",
    newAccountPubkey: userPoolKey,
    lamports: await solConnection.getMinimumBalanceForRentExemption(
      USER_POOL_SIZE
    ),
    space: USER_POOL_SIZE,
    programId: program.programId,
  });

  const tx = await program.rpc.initializeUserPool({
    accounts: {
      userPool: userPoolKey,
      owner: userAddress,
    },
    instructions: [ix],
    signers: [],
  });
  await solConnection.confirmTransaction(tx, "finalized");

  console.log("Your transaction signature", tx);
  let poolAccount = await program.account.userPool.fetch(userPoolKey);
  // console.log('Owner of initialized pool = ', poolAccount.owner.toBase58());
};

export const stakeNft = async (
  userAddress: PublicKey,
  mint: PublicKey,
  isLegendary: boolean,
  tier: number
) => {
  if (tier < 1 || tier > 3) return;

  let userTokenAccount = await getAssociatedTokenAccount(userAddress, mint);
  let accountOfNFT = await getNFTTokenAccount(mint);
  if (userTokenAccount.toBase58() != accountOfNFT.toBase58()) {
    let nftOwner = await getOwnerOfNFT(mint);
    console.log("=======", nftOwner.toBase58());
    console.log("@@@@@@@", userAddress.toBase58());
    if (nftOwner.toBase58() == userAddress.toBase58())
      userTokenAccount = accountOfNFT;
    else {
      console.log("Error: Nft is not owned by user");
      return;
    }
  }
  console.log("Shred NFT = ", mint.toBase58(), userTokenAccount.toBase58());

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    globalAuthority,
    [mint]
  );

  console.log("Dest NFT Account = ", destinationAccounts[0].toBase58());
  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  let poolAccount = await solConnection.getAccountInfo(userPoolKey);
  if (poolAccount === null || poolAccount.data === null) {
    await initUserPool(userAddress);
  }

  const metadata = await getMetadata(mint);
  console.log("Metadata=", metadata.toBase58());

  let userRewardAccount = await getAssociatedTokenAccount(
    userAddress,
    REWARD_TOKEN_MINT
  );
  console.log("User Reward Account = ", userRewardAccount.toBase58());

  try {
    const data = await solConnection.getAccountInfo(userRewardAccount);
    if (!data || !data.data) {
      console.log("User reward token associated token account is not exist");
      return;
    }
  } catch (e) {
    console.log("Fetch user reward token account");
    console.log(e);
    return;
  }

  let burnVault = await getAssociatedTokenAccount(
    BURN_WALLET_ADDRESS,
    REWARD_TOKEN_MINT
  );
  console.log("Burn Token Account = ", burnVault.toBase58());

  const tx = await program.rpc.stakeNftToPool(bump, isLegendary, tier, {
    accounts: {
      owner: userAddress,
      userPool: userPoolKey,
      globalAuthority,
      userTokenAccount,
      destNftTokenAccount: destinationAccounts[0],
      nftMint: mint,
      mintMetadata: metadata,
      burnVault,
      userRewardAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: METAPLEX,
    },
    instructions: [...instructions],
    signers: [],
  });
  await solConnection.confirmTransaction(tx, "singleGossip");
};

export const withdrawNft = async (userAddress: PublicKey, mint: PublicKey) => {
  let retUser = await getATokenAccountsNeedCreate(
    solConnection,
    payer.publicKey,
    userAddress,
    [mint]
  );
  let userTokenAccount = retUser.destinationAccounts[0];
  console.log("Shred NFT = ", mint.toBase58(), userTokenAccount.toBase58());

  // if (retUser.instructions.length > 0) {
  //   const tx = new Transaction().add(...retUser.instructions);

  //   tx.feePayer = payer.publicKey;
  //   tx.recentBlockhash = await (await solConnection.getLatestBlockhash()).blockhash;
  //   payer.signTransaction(tx);

  //   await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
  //   await solConnection.confirmTransaction('confirmed');
  // }

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    payer.publicKey,
    globalAuthority,
    [mint]
  );

  console.log("Dest NFT Account = ", destinationAccounts[0].toBase58());

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  // const tx = await program.methods.withdrawNftFromPool(bump).accounts({
  //     payer: payer.publicKey,
  //     owner: userAddress,
  //     userPool: userPoolKey,
  //     globalAuthority,
  //     userTokenAccount,
  //     destNftTokenAccount: destinationAccounts[0],
  //     nftMint: mint,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //   }).transaction();

  // tx.feePayer = payer.publicKey;
  // tx.recentBlockhash = await (await solConnection.getLatestBlockhash()).blockhash;
  // payer.signTransaction(tx);

  // console.log(await solConnection.simulateTransaction(tx));

  const tx = await program.rpc.withdrawNftFromPool(bump, {
    accounts: {
      payer: payer.publicKey,
      owner: userAddress,
      userPool: userPoolKey,
      globalAuthority,
      userTokenAccount,
      destNftTokenAccount: destinationAccounts[0],
      nftMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    instructions: [...retUser.instructions],
    signers: [],
  });
  await solConnection.confirmTransaction(tx, "singleGossip");
};

export const claimReward = async (userAddress: PublicKey) => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  console.log("globalAuthority =", globalAuthority.toBase58());

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  console.log("userPool =", userPoolKey.toBase58());

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    userAddress,
    userAddress,
    [REWARD_TOKEN_MINT]
  );

  console.log("User Reward Account = ", destinationAccounts[0].toBase58());

  const tx = await program.rpc.claimReward(bump, {
    accounts: {
      owner: userAddress,
      userPool: userPoolKey,
      globalAuthority,
      rewardVault,
      userRewardAccount: destinationAccounts[0],
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    instructions: [...instructions],
    signers: [],
  });

  console.log("Your transaction signature", tx);
  await solConnection.confirmTransaction(tx, "singleGossip");

  console.log(
    await solConnection.getTokenAccountBalance(destinationAccounts[0])
  );
};

export const getAllStakers = async () => {
  const pools = await provider.connection.getParsedProgramAccounts(
    program.programId,
    {
      filters: [
        {
          dataSize: STAKING_USER_POOL_SIZE,
        },
      ],
    }
  );
  let result = [];
  let count = 0;
  pools.map((pool) => {
    const buffer = pool.account.data as Buffer;
    let buf;
    const owner = new PublicKey(buffer.slice(8, 40));

    buf = buffer.slice(40, 48).reverse();
    const stakedCount = new anchor.BN(buf).toNumber();

    if (!stakedCount) return;

    let nfts = [];
    for (let i = 0; i < stakedCount; i++) {
      buf = buffer.slice(i * 48 + 48, i * 48 + 80);
      const mint = new PublicKey(buf);
      nfts.push(mint);
      count++;
    }

    result.push({
      user: owner.toBase58(),
      nfts: nfts.map((nft) => nft.toBase58()),
    });
  });

  console.log(`==> Got ${count} stakings`);

  fs.writeFileSync("./stakings.json", JSON.stringify(result));
};

export const calculateAvailableReward = async (userAddress: PublicKey) => {
  const userPool: UserPool = await getUserPoolState(userAddress);
  const userPoolInfo = {
    // ...userPool,
    owner: userPool.owner.toBase58(),
    stakedMints: userPool.stakedMints
      .slice(0, userPool.stakedCount.toNumber())
      .map((info) => {
        return {
          // ...info,
          mint: info.mint.toBase58(),
          stakedTime: info.stakedTime.toNumber(),
          isLegendary: new anchor.BN(info.isLegendary).toNumber(),
          tier: info.tier.toNumber(),
        };
      }),
    stakedCount: userPool.stakedCount.toNumber(),
    tier1StakedCount: userPool.tier1StakedCount.toNumber(),
    tier2StakedCount: userPool.tier2StakedCount.toNumber(),
    tier3StakedCount: userPool.tier3StakedCount.toNumber(),
    remainingRewards: userPool.remainingRewards.toNumber(),
    lastRewardTime: new Date(
      1000 * userPool.lastRewardTime.toNumber()
    ).toLocaleString(),
  };
  console.log(userPoolInfo);

  let now = Math.floor(Date.now() / 1000);
  let totalReward = 0;
  console.log(
    `Now: ${now} Last_Reward_Time: ${userPool.lastRewardTime.toNumber()}`
  );
  for (let i = 0; i < userPoolInfo.stakedCount; i++) {
    let lastRewardTime = userPool.lastRewardTime.toNumber();
    if (lastRewardTime < userPoolInfo.stakedMints[i].stakedTime) {
      lastRewardTime = userPoolInfo.stakedMints[i].stakedTime;
    }

    let factor = 100;
    let rewardAmount = NORMAL_REWARD_AMOUNT;
    if (userPoolInfo.stakedMints[i].isLegendary == 1) {
      rewardAmount = LEGENDARY_REWARD_AMOUNT;
    }

    switch (userPoolInfo.stakedMints[i].tier) {
      case 1:
        if (userPoolInfo.tier1StakedCount > 2) {
          factor = FACTOR;
        }
        factor *= TIER1_FACTOR;
        break;
      case 2:
        if (userPoolInfo.tier2StakedCount > 2) {
          factor = FACTOR;
        }
        factor *= TIER2_FACTOR;
        break;
      default:
        if (userPoolInfo.tier3StakedCount > 2) {
          factor = FACTOR;
        }
        factor *= TIER3_FACTOR;
    }
    let reward = 0;
    reward =
      (Math.floor((now - lastRewardTime) / EPOCH) * rewardAmount * factor) /
      10000;

    totalReward += reward;
  }
  totalReward += userPoolInfo.remainingRewards;
  return totalReward / DECIMALS;
};

export const getGlobalState = async (): Promise<GlobalPool | null> => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  try {
    let globalState = await program.account.globalPool.fetch(globalAuthority);
    return globalState as unknown as GlobalPool;
  } catch {
    return null;
  }
};

export const getUserPoolState = async (
  userAddress: PublicKey
): Promise<UserPool | null> => {
  if (!userAddress) return null;

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  console.log("User Pool: ", userPoolKey.toBase58());
  try {
    let poolState = await program.account.userPool.fetch(userPoolKey);
    return poolState as unknown as UserPool;
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
        walletAddress,
        destinationPubkey,
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

// export const createAssociatedTokenAccountInstruction = (
//   associatedTokenAddress: anchor.web3.PublicKey,
//   payer: anchor.web3.PublicKey,
//   walletAddress: anchor.web3.PublicKey,
//   splTokenMintAddress: anchor.web3.PublicKey
// ) => {
//   const keys = [
//     { pubkey: payer, isSigner: true, isWritable: true },
//     { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
//     { pubkey: walletAddress, isSigner: false, isWritable: false },
//     { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
//     {
//       pubkey: anchor.web3.SystemProgram.programId,
//       isSigner: false,
//       isWritable: false,
//     },
//     { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
//     {
//       pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
//       isSigner: false,
//       isWritable: false,
//     },
//   ];
//   return new anchor.web3.TransactionInstruction({
//     keys,
//     programId: ASSOCIATED_TOKEN_PROGRAM_ID,
//     data: Buffer.from([]),
//   });
// };

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
