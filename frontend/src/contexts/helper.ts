import * as anchor from "@project-serum/anchor";
import {
  AccountInfo,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { GlobalPool, UserPool } from "./types";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { IDL } from "./shred_staking";
import { programs } from "@metaplex/js";
import { errorAlert, successAlert } from "../components/toastGroup";
import {
  DECIMALS,
  EPOCH,
  FACTOR,
  LEGENDARY_REWARD_AMOUNT,
  NORMAL_REWARD_AMOUNT,
  USER_POOL_SIZE,
  GLOBAL_AUTHORITY_SEED,
  REWARD_TOKEN_MINT,
  PROGRAM_ID,
  solConnection,
  METAPLEX,
  DIAMOND_REWARD_AMOUNT,
} from "../config";
import { getMetadata } from "./bootcamp_helper";

export const getNftMetaData = async (nftMintPk: PublicKey) => {
  let {
    metadata: { Metadata },
  } = programs;
  let metadataAccount = await Metadata.getPDA(nftMintPk);
  const metadat = await Metadata.load(solConnection, metadataAccount);
  return metadat;
};

export const initProject = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) return;
  let cloneWindow: any = window;

  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const rewardVault = await getAssociatedTokenAccount(
    globalAuthority,
    REWARD_TOKEN_MINT
  );
  const tx = await program.rpc.initialize(bump, {
    accounts: {
      admin: wallet.publicKey,
      globalAuthority,
      rewardVault,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
    signers: [],
  });
  await solConnection.confirmTransaction(tx, "confirmed");
  await new Promise((resolve, reject) => {
    solConnection.onAccountChange(
      globalAuthority,
      (data: AccountInfo<Buffer> | null) => {
        if (!data) reject();
        resolve(true);
      }
    );
  });

  successAlert("Success. txHash=" + tx);
  return false;
};

export const getAssociatedTokenAccount = async (
  ownerPubkey: PublicKey,
  mintPk: PublicKey
): Promise<PublicKey> => {
  // console.log(mintPk, "mintPk")
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

export const getGlobalState = async (): Promise<GlobalPool | null> => {
  let cloneWindow: any = window;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  const [globalAuthority] = await PublicKey.findProgramAddress(
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
  let cloneWindow: any = window;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  try {
    let poolState = await program.account.userPool.fetch(userPoolKey);
    return poolState as unknown as UserPool;
  } catch {
    return null;
  }
};

export const getUserPoolAccounts = async () => {
  let cloneWindow: any = window;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

  let poolAccounts = await solConnection.getProgramAccounts(program.programId, {
    filters: [
      {
        dataSize: USER_POOL_SIZE,
      },
    ],
  });
  let users: any = [];
  for (let item of poolAccounts) {
    const address = new PublicKey(item.account.data.slice(8, 40)).toBase58();
    const count = new anchor.BN(item.account.data[40]).toNumber();
    users.push({
      address: address,
      count: count,
    });
  }
  users.sort(function (a: any, b: any) {
    return a.count - b.count;
  });
  return users;
};

export const stakeNft = async (
  wallet: WalletContextState,
  mint: PublicKey,
  isLegendary: boolean,
  startLoading: Function,
  endLoading: Function,
  updatePageStates: Function
) => {
  startLoading();
  let userAddress: PublicKey | null = wallet.publicKey;
  if (!userAddress) return;
  let userTokenAccount = await getAssociatedTokenAccount(userAddress, mint);
  let accountOfNFT = await getNFTTokenAccount(mint);
  console.log(
    "Shred NFT = ",
    mint.toBase58(),
    userTokenAccount.toBase58(),
    accountOfNFT.toBase58()
  );
  if (userTokenAccount.toBase58() !== accountOfNFT.toBase58()) {
    let ownerOfNAFT = await getOwnerOfNFT(mint);
    if (ownerOfNAFT.toBase58() === userAddress.toBase58()) {
      userTokenAccount = accountOfNFT;
    } else {
      errorAlert("NFT is not owned by this wallet.");
      endLoading();
      return;
    }
  }
  // console.log("Shred NFT = ", mint.toBase58(), userTokenAccount.toBase58());
  try {
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(
      solConnection,
      cloneWindow["solana"],
      anchor.AnchorProvider.defaultOptions()
    );
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );
    let userPoolKey = await PublicKey.createWithSeed(
      userAddress,
      "user-pool",
      program.programId
    );

    let { instructions, destinationAccounts } =
      await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        globalAuthority,
        [mint]
      );
    let poolAccount = await solConnection.getAccountInfo(userPoolKey);
    if (poolAccount === null || poolAccount.data === null) {
      await initUserPool(wallet);
      successAlert(
        "Creating data account for user has been successful!\nTry staking again"
      );
      endLoading();
      updatePageStates();
      return;
    }

    const metadata = await getMetadata(mint);
    console.log("Metadata=", metadata.toBase58());

    const tx = new Transaction();
    if (instructions.length > 0) tx.add(instructions[0]);
    tx.add(
      program.instruction.stakeNftToPool(bump, isLegendary, {
        accounts: {
          owner: userAddress,
          userPool: userPoolKey,
          globalAuthority,
          userTokenAccount,
          destNftTokenAccount: destinationAccounts[0],
          nftMint: mint,
          mintMetadata: metadata,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenMetadataProgram: METAPLEX,
        },
        instructions: [
          //...instructions,
        ],
        signers: [],
      })
    );
    const txId = await wallet.sendTransaction(tx, solConnection);
    await solConnection.confirmTransaction(txId, "finalized");
    successAlert("Staking has been successful!");
    endLoading();
    updatePageStates();
  } catch (error) {
    endLoading();
    console.log(error);
  }
};

export const withdrawNft = async (
  wallet: WalletContextState,
  mint: PublicKey,
  startLoading: Function,
  endLoading: Function,
  updatePageStates: Function
) => {
  let userAddress: PublicKey | null = wallet.publicKey;
  if (!userAddress) return;
  startLoading();
  try {
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(
      solConnection,
      cloneWindow["solana"],
      anchor.AnchorProvider.defaultOptions()
    );
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    const tx = new Transaction();
    // User NFT account to withdraw
    let { instructions, destinationAccounts } =
      await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        userAddress,
        [mint]
      );
    if (instructions.length > 0) {
      tx.add(instructions[0]);
    }
    let userTokenAccount = destinationAccounts[0];

    // Get staked nft address in PDA
    let result = await getATokenAccountsNeedCreate(
      solConnection,
      userAddress,
      globalAuthority,
      [mint]
    );

    // console.log("Dest NFT Account = ", destinationAccounts[0].toBase58());

    let userPoolKey = await PublicKey.createWithSeed(
      userAddress,
      "user-pool",
      program.programId
    );

    tx.add(
      program.instruction.withdrawNftFromPool(bump, {
        accounts: {
          owner: userAddress,
          userPool: userPoolKey,
          globalAuthority,
          userTokenAccount,
          destNftTokenAccount: result.destinationAccounts[0],
          nftMint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [],
        signers: [],
      })
    );
    const txId = await wallet.sendTransaction(tx, solConnection);
    await solConnection.confirmTransaction(txId, "finalized");
    successAlert("Unstaking has been successful!");
    endLoading();
    updatePageStates();
  } catch (error) {
    endLoading();
    console.log(error);
  }
  endLoading();
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
    if (walletAddress !== owner) {
      const userAccount = await getAssociatedTokenAccount(walletAddress, mint);
      response = await connection.getAccountInfo(userAccount);
      if (!response) {
        const createATAIx = createAssociatedTokenAccountInstruction(
          userAccount,
          walletAddress,
          walletAddress,
          mint
        );
        instructions.push(createATAIx);
      }
    }
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

export const initUserPool = async (wallet: WalletContextState) => {
  let userAddress = wallet.publicKey;
  if (!userAddress) return;
  let cloneWindow: any = window;
  let provider = new anchor.AnchorProvider(
    solConnection,
    cloneWindow["solana"],
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

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

  let tx = new Transaction();
  tx.add(ix);
  tx.add(
    program.instruction.initializeUserPool({
      accounts: {
        userPool: userPoolKey,
        owner: userAddress,
      },
      instructions: [
        //ix
      ],
      signers: [],
    })
  );
  const txId = await wallet.sendTransaction(tx, solConnection);
  await solConnection.confirmTransaction(txId, "finalized");

  // console.log("Your transaction signature", tx);
  // let poolAccount = await program.account.userPool.fetch(userPoolKey);
  // console.log('Owner of initialized pool = ', poolAccount.owner.toBase58());
};

export const claimReward = async (
  wallet: WalletContextState,
  startLoading: Function,
  endLoading: Function
) => {
  let userAddress = wallet.publicKey as PublicKey;
  if (!userAddress) return;
  startLoading();
  try {
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(
      solConnection,
      cloneWindow["solana"],
      anchor.AnchorProvider.defaultOptions()
    );
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    // console.log("globalAuthority =", globalAuthority.toBase58());

    let userPoolKey = await PublicKey.createWithSeed(
      userAddress,
      "user-pool",
      program.programId
    );

    let { instructions, destinationAccounts } =
      await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        userAddress,
        [REWARD_TOKEN_MINT]
      );

    const rewardVault = await getAssociatedTokenAccount(
      globalAuthority,
      REWARD_TOKEN_MINT
    );

    // console.log("Dest NFT Account = ", destinationAccounts[0].toBase58());
    // console.log(await solConnection.getTokenAccountBalance(destinationAccounts[0]));
    const tx = new Transaction();
    if (instructions.length > 0) tx.add(instructions[0]);
    tx.add(
      program.instruction.claimReward(bump, {
        accounts: {
          owner: userAddress,
          userPool: userPoolKey,
          globalAuthority,
          rewardVault,
          userRewardAccount: destinationAccounts[0],
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [
          //...instructions,
        ],
        signers: [],
      })
    );

    const txId = await wallet.sendTransaction(tx, solConnection);
    // console.log("Your transaction signature", tx);
    await solConnection.confirmTransaction(txId, "singleGossip");
    endLoading();
    // await new Promise((resolve, reject) => {
    //     solConnection.onAccountChange(userPoolKey, (data: AccountInfo<Buffer> | null) => {
    //         if (!data) reject();
    //         resolve(true);
    //     });
    // });
    // console.log(await solConnection.getTokenAccountBalance(destinationAccounts[0]));
    successAlert("Claim succeeded!");
  } catch (error) {
    endLoading();
    console.log(error);
  }
  endLoading();
};

export const calculateAvailableReward = async (
  userAddress: PublicKey,
  now: number
) => {
  const userPool: UserPool | null = await getUserPoolState(userAddress);
  if (userPool === null) return 0;
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
        };
      }),
    stakedCount: userPool.stakedCount.toNumber(),
    remainingRewards: userPool.remainingRewards.toNumber(),
    lastRewardTime: new Date(
      1000 * userPool.lastRewardTime.toNumber()
    ).toLocaleString(),
  };
  // console.log(userPoolInfo);

  let totalReward = 0;
  // console.log(`Now: ${now} Last_Reward_Time: ${userPool.lastRewardTime.toNumber()}`);
  for (let i = 0; i < userPoolInfo.stakedCount; i++) {
    let lastRewardTime = userPool.lastRewardTime.toNumber();
    if (lastRewardTime < userPoolInfo.stakedMints[i].stakedTime) {
      lastRewardTime = userPoolInfo.stakedMints[i].stakedTime;
    }

    let factor = 100;
    let rewardAmount = NORMAL_REWARD_AMOUNT;
    if (userPoolInfo.stakedMints[i].isLegendary === 1) {
      rewardAmount = LEGENDARY_REWARD_AMOUNT;
    } else if (userPoolInfo.stakedMints[i].isLegendary === 2) {
      rewardAmount = DIAMOND_REWARD_AMOUNT;
    }
    if (userPoolInfo.stakedCount > 2) {
      factor = FACTOR;
    }

    let reward = 0;
    reward =
      (Math.floor((now - lastRewardTime) / EPOCH) * rewardAmount * factor) /
      100;

    totalReward += Math.floor(reward);
  }
  totalReward += userPoolInfo.remainingRewards;
  return totalReward / DECIMALS;
};

export const getOwnerOfNFT = async (
  nftMintPk: PublicKey
): Promise<PublicKey> => {
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

export const getNFTTokenAccount = async (
  nftMintPk: PublicKey
): Promise<PublicKey> => {
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
