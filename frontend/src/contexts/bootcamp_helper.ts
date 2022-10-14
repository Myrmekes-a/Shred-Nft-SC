import * as anchor from "@project-serum/anchor";
import {
  AccountInfo,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { programs } from "@metaplex/js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { GlobalPool, UserPool } from "./bootcamp_types";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { IDL } from "./shred_bootcamp";
import { JUICEIDL } from "./juiced_ape_evolution";
import { errorAlert, successAlert } from "../components/toastGroup";
import {
  DECIMALS,
  EPOCH,
  FACTOR,
  LEGENDARY_REWARD_AMOUNT,
  NORMAL_REWARD_AMOUNT,
  BOOTCAMP_USER_POOL_SIZE,
  GLOBAL_AUTHORITY_SEED,
  REWARD_TOKEN_MINT,
  BOOTCAMP_PROGRAM_ID,
  solConnection,
  METAPLEX,
  TIER1_FACTOR,
  TIER2_FACTOR,
  TIER3_FACTOR,
  BURN_WALLET_ADDRESS,
  JUICING_GLOBAL_AUTHORITY_SEED,
  JUICING_PROGRAM_ID,
} from "../config";
import {
  getAssociatedTokenAccount,
  getATokenAccountsNeedCreate,
  getNFTTokenAccount,
  getOwnerOfNFT,
} from "./helper";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

import corresponding from "./old_to_new.json";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";

export let TOKEN_DECIMALS = 1_000_000;
export const NFT_POOL_SEED = "juicing-nft-pool";

export const nftToMutable = async (
  wallet: WalletContextState,
  stakedNftMint: PublicKey
) => {
  if (!wallet.publicKey) return;

  let cloneWindow: any = window;

  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );

  const juicingProgram = new anchor.Program(
    JUICEIDL as anchor.Idl,
    JUICING_PROGRAM_ID,
    provider
  );

  const [juicingGlobal, juicingBump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgram.programId
  );
  console.log("JuicingGlobalAuthority: ", juicingGlobal.toBase58());

  const [nftPoolKey, nftBump] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), stakedNftMint.toBuffer()],
    juicingProgram.programId
  );
  console.log("nftPoolKey: ", nftPoolKey.toBase58());

  let nftPoolAccount = await solConnection.getAccountInfo(nftPoolKey);
  // console.log("nftPoolAccout", nftPoolAccount);
  if (nftPoolAccount === null || nftPoolAccount.data === null) {
    console.log("Creating NFT Pool...");
    await initNftPool(wallet, stakedNftMint);
  }

  let newNftMint;

  for (let i = 0; i < corresponding.length; i++) {
    if (corresponding[i].oldPubkey === stakedNftMint.toString()) {
      newNftMint = corresponding[i].newPubkey;
      break;
    }
    continue;
  }

  if (newNftMint === undefined) {
    console.log("No matching NFT");
    return;
  }

  // let stakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, stakedNftMint);
  let oldNftAta = await getATokenAccountsNeedCreate(
    solConnection,
    wallet.publicKey,
    wallet.publicKey,
    [stakedNftMint]
  );
  console.log("stakedATA", oldNftAta.destinationAccounts[0].toBase58());

  // let newStakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, new PublicKey(newNftMint));
  let newNftAta = await getATokenAccountsNeedCreate(
    solConnection,
    wallet.publicKey,
    wallet.publicKey,
    [new PublicKey(newNftMint)]
  );
  console.log("NewNftATA >>", newNftAta.destinationAccounts[0].toBase58());

  let nftVault = await getATokenAccountsNeedCreate(
    solConnection,
    wallet.publicKey,
    juicingGlobal,
    [new PublicKey(newNftMint)]
  );
  console.log("NFTBault >>", nftVault.destinationAccounts[0].toBase58());

  let newNftAccount = await solConnection.getAccountInfo(
    nftVault.destinationAccounts[0]
  );
  if (newNftAccount == null) {
    console.log("No NFT in the NFT Vault!");
    return;
  }

  let burnAccount = await getATokenAccountsNeedCreate(
    solConnection,
    wallet.publicKey,
    BURN_WALLET_ADDRESS,
    [stakedNftMint]
  );
  console.log("BurnAccout", burnAccount.destinationAccounts[0].toBase58());

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
  if (idx === -1) {
    return;
  }

  let newNftId = newNftName.slice(idx + 1);

  console.log("Owner: ", wallet.publicKey.toBase58());

  let tx = new Transaction();

  if (nftVault.instructions.length > 0) tx.add(nftVault.instructions[0]);
  console.log("#instruction1 =", nftVault.instructions[0]);
  if (oldNftAta.instructions.length > 0) tx.add(oldNftAta.instructions[0]);
  console.log("#instruction2 =", oldNftAta.instructions[0]);
  if (newNftAta.instructions.length > 0) tx.add(newNftAta.instructions[0]);
  console.log("#instruction3 =", newNftAta.instructions[0]);
  if (burnAccount.instructions.length > 0) tx.add(burnAccount.instructions[0]);
  console.log("#instruction4 =", burnAccount.instructions[0]);

  tx.add(
    juicingProgram.instruction.nftToMutable(juicingBump, nftBump, newNftId, {
      accounts: {
        owner: wallet.publicKey,
        nftMint: stakedNftMint,
        globalAuthority: juicingGlobal,
        nftPool: nftPoolKey,
        userTokenAccount: oldNftAta.destinationAccounts[0],
        newUserTokenAccount: newNftAta.destinationAccounts[0],
        nftVault: nftVault.destinationAccounts[0],
        burnAccount: burnAccount.destinationAccounts[0],
        mintMetadata: oldMetadata,
        tokenMetadataProgram: METAPLEX,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: [],
      signers: [],
    })
  );
  let { blockhash } = await provider.connection.getLatestBlockhash("confirmed");
  tx.feePayer = wallet.publicKey as PublicKey;
  tx.recentBlockhash = blockhash;
  if (wallet.signTransaction !== undefined) {
    const signedTransaction = await wallet.signTransaction(tx);

    let txId = await provider.connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: true,
        maxRetries: 3,
        preflightCommitment: "confirmed",
      }
    );

    console.log(txId, "==> txId");

    await solConnection.confirmTransaction(txId, "finalized");
  }
  // closeLoading();
  console.log("Your transaction signature", tx);
  // updatePage();
};

export const mutNftFromBootcamp = async (
  wallet: WalletContextState,
  stakedNftMint: PublicKey,
  startLoading: Function,
  closeLoading: Function,
  updatePage: Function
) => {
  if (!wallet.publicKey) return;
  let cloneWindow: any = window;

  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );

  const program = new anchor.Program(
    IDL as anchor.Idl,
    BOOTCAMP_PROGRAM_ID,
    provider
  );

  const juicingProgram = new anchor.Program(
    JUICEIDL as anchor.Idl,
    JUICING_PROGRAM_ID,
    provider
  );
  try {
    startLoading();
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    const [juicingGlobal, juicingBump] = await PublicKey.findProgramAddress(
      [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
      juicingProgram.programId
    );

    // console.log("Juicing Global Address", juicingGlobal.toBase58());

    let userPoolKey = await PublicKey.createWithSeed(
      wallet.publicKey,
      "user-pool",
      program.programId
    );

    // console.log("userPoolKey: ", userPoolKey.toBase58());

    let poolAccount = await solConnection.getAccountInfo(userPoolKey);
    if (poolAccount === null || poolAccount.data === null) {
      // console.log("Creating UserPool Account...");
      await initUserPool(wallet);
    }

    const [nftPoolKey, nftBump] = await PublicKey.findProgramAddress(
      [Buffer.from(NFT_POOL_SEED), stakedNftMint.toBuffer()],
      juicingProgram.programId
    );
    // console.log("nftPoolKey: ", nftPoolKey.toBase58());

    let nftPoolAccount = await solConnection.getAccountInfo(nftPoolKey);
    // console.log("nftPoolAccout", nftPoolAccount);
    if (nftPoolAccount === null || nftPoolAccount.data === null) {
      console.log("Creating NFT Pool...");
      await initNftPool(wallet, stakedNftMint);
    }

    // let corresponding = Name;
    let newNftMint;

    for (let i = 0; i < corresponding.length; i++) {
      if (corresponding[i].oldPubkey === stakedNftMint.toString()) {
        newNftMint = corresponding[i].newPubkey;
        break;
      }
      continue;
    }

    if (newNftMint === undefined) {
      console.log("No matching NFT");
      return;
    }

    // let stakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, stakedNftMint);
    let oldNftAta = await getATokenAccountsNeedCreate(
      solConnection,
      wallet.publicKey,
      globalAuthority,
      [stakedNftMint]
    );
    // console.log("stakedATA", oldNftAta.destinationAccounts[0].toBase58());

    // let newStakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, new PublicKey(newNftMint));
    let newNftAta = await getATokenAccountsNeedCreate(
      solConnection,
      wallet.publicKey,
      globalAuthority,
      [new PublicKey(newNftMint)]
    );

    let { instructions, destinationAccounts } =
      await getATokenAccountsNeedCreate(
        solConnection,
        wallet.publicKey,
        juicingGlobal,
        [new PublicKey(newNftMint)]
      );

    // console.log("NFT Vault", destinationAccounts[0].toBase58());

    let ret = await getATokenAccountsNeedCreate(
      solConnection,
      wallet.publicKey,
      BURN_WALLET_ADDRESS,
      [stakedNftMint]
    );

    let newNftAccount = await solConnection.getAccountInfo(
      destinationAccounts[0]
    );

    if (newNftAccount == null) {
      console.log("No NFT in the NFT Vault!");
      closeLoading();
      return;
    }

    const oldMetadata = await getMetadata(stakedNftMint);
    const newMetadata = await getMetadata(new PublicKey(newNftMint));
    console.log("Metadata!!!!!!");
    //Another method that can be used to fetch address of the metadata account is as bellows
    // const metadataAccount = await Metadata.getPDA(new PublicKey(newNftAddress));

    let {
      metadata: { Metadata },
    } = programs;
    const metadata = await Metadata.load(solConnection, newMetadata);
    let newNftName = metadata.data.data.name;

    console.log("NAME!!!!!!!");
    let idx = newNftName.indexOf("#");
    if (idx === -1) {
      console.log("No matching NFT!");
      return;
    }

    let newNftId = newNftName.slice(idx + 1);
    console.log("NewNFTID!!!!!!!!!", newNftId);

    let tx = new Transaction();

    if (instructions.length > 0) tx.add(instructions[0]);
    if (ret.instructions.length > 0) tx.add(ret.instructions[0]);
    if (oldNftAta.instructions.length > 0) tx.add(oldNftAta.instructions[0]);
    if (newNftAta.instructions.length > 0) tx.add(newNftAta.instructions[0]);

    tx.add(
      program.instruction.mutBootcampNft(bump, juicingBump, nftBump, newNftId, {
        accounts: {
          owner: wallet.publicKey,
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
          juicingProgram: juicingProgram.programId,
          mintMetadata: oldMetadata,
          tokenMetadataProgram: METAPLEX,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [],
        signers: [],
      })
    );
    let { blockhash } = await provider.connection.getLatestBlockhash(
      "confirmed"
    );
    tx.feePayer = wallet.publicKey as PublicKey;
    tx.recentBlockhash = blockhash;
    if (wallet.signTransaction !== undefined) {
      const signedTransaction = await wallet.signTransaction(tx);

      let txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: true,
          maxRetries: 3,
          preflightCommitment: "confirmed",
        }
      );

      console.log(txId, "==> txId");

      await solConnection.confirmTransaction(txId, "finalized");
    }
    closeLoading();
    console.log("Your transaction signature", tx);
    updatePage();
  } catch (error) {
    closeLoading();
    console.log("Error-----", error);
  }
};

export const checkMutable = async (mint: PublicKey) => {
  const cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );

  const juicingProgram = new anchor.Program(
    JUICEIDL as anchor.Idl,
    JUICING_PROGRAM_ID,
    provider
  );
  const [nftPoolKey] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), mint.toBuffer()],
    juicingProgram.programId
  );
  console.log("nftPoolKey: ", nftPoolKey.toBase58());
  let nftPoolAccountInfo = await getNFTTokenAccount(mint);
  console.log(nftPoolAccountInfo);
};

export const initNftPool = async (
  wallet: WalletContextState,
  mint: PublicKey
) => {
  if (!wallet.publicKey) return;

  let cloneWindow: any = window;

  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );

  const juicingProgram = new anchor.Program(
    JUICEIDL as anchor.Idl,
    JUICING_PROGRAM_ID,
    provider
  );
  const [nftPoolKey, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), mint.toBuffer()],
    juicingProgram.programId
  );
  try {
    let tx = new Transaction();

    tx.add(
      juicingProgram.instruction.initializeNftPool(bump, {
        accounts: {
          owner: wallet.publicKey,
          nftMint: mint,
          nftPool: nftPoolKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [],
      })
    );
    // const txId = await provider.sendAndConfirm(tx, [], {
    //   commitment: "confirmed",
    // });
    // await solConnection.confirmTransaction(txId, "finalized");
    let { blockhash } = await provider.connection.getLatestBlockhash(
      "confirmed"
    );
    tx.feePayer = wallet.publicKey as PublicKey;
    tx.recentBlockhash = blockhash;
    if (wallet.signTransaction !== undefined) {
      const signedTransaction = await wallet.signTransaction(tx);

      let txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: true,
          maxRetries: 3,
          preflightCommitment: "confirmed",
        }
      );

      console.log("-------------", txId, "==> txId");

      await solConnection.confirmTransaction(txId, "finalized");
    }
    // console.log("Your transaction signature!!!!!!!", tx);
    // await solConnection.confirmTransaction(tx, "confirmed");

    // console.log("Your transaction signature", tx);
  } catch (error) {
    console.log(error);
  }
};

export const initProject = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) return;
  let cloneWindow: any = window;

  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(
    IDL as anchor.Idl,
    BOOTCAMP_PROGRAM_ID,
    provider
  );

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

export const getMyNft = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) return;
  let tokenAccounts = await getParsedNftAccountsByOwner({
    publicAddress: wallet.publicKey.toBase58(),
    connection: solConnection,
  });
  return tokenAccounts;
};

export const getGlobalState = async (): Promise<GlobalPool | null> => {
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(
    IDL as anchor.Idl,
    BOOTCAMP_PROGRAM_ID,
    provider
  );
  const [globalAuthority] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("                  Global", globalAuthority.toBase58());
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
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(
    IDL as anchor.Idl,
    BOOTCAMP_PROGRAM_ID,
    provider
  );

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
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(
    IDL as anchor.Idl,
    BOOTCAMP_PROGRAM_ID,
    provider
  );

  let poolAccounts = await solConnection.getProgramAccounts(program.programId, {
    filters: [
      {
        dataSize: BOOTCAMP_USER_POOL_SIZE,
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
  bootCampIndex: number,
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
    let provider = new anchor.Provider(
      solConnection,
      cloneWindow["solana"],
      anchor.Provider.defaultOptions()
    );
    const program = new anchor.Program(
      IDL as anchor.Idl,
      BOOTCAMP_PROGRAM_ID,
      provider
    );
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
    console.log("BurnVault: ", burnVault.toBase58());

    const tx = new Transaction();
    if (instructions.length > 0) tx.add(instructions[0]);
    tx.add(
      program.instruction.stakeNftToPool(bump, isLegendary, bootCampIndex, {
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
    let provider = new anchor.Provider(
      solConnection,
      cloneWindow["solana"],
      anchor.Provider.defaultOptions()
    );
    const program = new anchor.Program(
      IDL as anchor.Idl,
      BOOTCAMP_PROGRAM_ID,
      provider
    );
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

export const initUserPool = async (wallet: WalletContextState) => {
  let userAddress = wallet.publicKey;
  if (!userAddress) return;
  let cloneWindow: any = window;
  let provider = new anchor.Provider(
    solConnection,
    cloneWindow["solana"],
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(
    IDL as anchor.Idl,
    BOOTCAMP_PROGRAM_ID,
    provider
  );
  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  // console.log(USER_POOL_SIZE);
  let ix = SystemProgram.createAccountWithSeed({
    fromPubkey: userAddress,
    basePubkey: userAddress,
    seed: "user-pool",
    newAccountPubkey: userPoolKey,
    lamports: await solConnection.getMinimumBalanceForRentExemption(
      BOOTCAMP_USER_POOL_SIZE
    ),
    space: BOOTCAMP_USER_POOL_SIZE,
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
    let provider = new anchor.Provider(
      solConnection,
      cloneWindow["solana"],
      anchor.Provider.defaultOptions()
    );
    const program = new anchor.Program(
      IDL as anchor.Idl,
      BOOTCAMP_PROGRAM_ID,
      provider
    );

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
          tier: info.tier.toNumber(),
          isLegendary: new anchor.BN(info.isLegendary).toNumber(),
        };
      }),
    stakedCount: userPool.stakedCount.toNumber(),
    tier1Count: userPool.tier1StakedCount.toNumber(),
    tier2Count: userPool.tier2StakedCount.toNumber(),
    tier3Count: userPool.tier3StakedCount.toNumber(),
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
    }

    switch (userPoolInfo.stakedMints[i].tier) {
      case 1:
        if (userPoolInfo.tier1Count > 2) {
          factor = FACTOR;
        }
        factor *= TIER1_FACTOR;
        break;
      case 2:
        if (userPoolInfo.tier2Count > 2) {
          factor = FACTOR;
        }
        factor *= TIER2_FACTOR;
        break;
      default:
        if (userPoolInfo.tier3Count > 2) {
          factor = FACTOR;
        }
        factor *= TIER3_FACTOR;
    }
    let reward = 0;
    reward =
      (Math.floor((now - lastRewardTime) / EPOCH) * rewardAmount * factor) /
      10000;

    totalReward += Math.floor(reward);
  }
  totalReward += userPoolInfo.remainingRewards;
  return totalReward / DECIMALS;
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

export const getNftMetadata = async (
  mint: PublicKey
  // connection: anchor.web3.Connection
) => {
  let tokenmetaPubkey = await Metadata.getPDA(mint);
  const tokenmeta = await Metadata.load(solConnection, tokenmetaPubkey);
  // console.log(tokenmeta.data);
  return tokenmeta.data;
};
