import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { programs } from "@metaplex/js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { IDL as JUICEIDL } from "./juiced_ape_evolution";
import { IDL } from "./shred_bootcamp";
import corresponding from "./old_to_new.json";
import {
  BOOTCAMP_PROGRAM_ID,
  BURN_WALLET_ADDRESS,
  GLOBAL_AUTHORITY_SEED,
  JUICING_BACKEND_API_URL,
  JUICING_GLOBAL_AUTHORITY_SEED,
  JUICING_PROGRAM_ID,
  JUICING_SOL_VAULT_SEED,
  JUICING_USER_POOL_SEED,
  METAPLEX,
  solConnection,
} from "../config";
import { getATokenAccountsNeedCreate, getNFTTokenAccount } from "./helper";
import { getMetadata } from "./bootcamp_helper";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const NFT_POOL_SEED = "juicing-nft-pool";

export const allNftToMutable = async (
  wallet: WalletContextState,
  mints: PublicKey[],
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

  const juicingProgram = new anchor.Program(
    JUICEIDL as anchor.Idl,
    JUICING_PROGRAM_ID,
    provider
  );

  try {
    startLoading();
    let transactions: Transaction[] = [];

    for (let mint of mints) {
      const txs = await mutNftFromWalletTx(wallet, mint, juicingProgram);
      if (txs) transactions.push(...txs);
    }

    let { blockhash } = await provider.connection.getLatestBlockhash(
      "confirmed"
    );

    transactions.forEach((transaction) => {
      transaction.feePayer = wallet.publicKey as PublicKey;
      transaction.recentBlockhash = blockhash;
    });

    if (wallet.signAllTransactions !== undefined) {
      const signedTransactions = await wallet.signAllTransactions(transactions);

      let signatures = await Promise.all(
        signedTransactions.map(
          (transaction) =>
            provider.connection.sendRawTransaction(transaction.serialize(), {
              skipPreflight: true,
              maxRetries: 3,
              preflightCommitment: "confirmed",
            })
          // wallet.sendTransaction(transaction, provider.connection, {maxRetries: 3, preflightCommitment: 'confirmed'})
        )
      );

      console.log("Your transaction signatures", signatures);
      await Promise.all(
        signatures.map((signature) =>
          provider.connection.confirmTransaction(signature, "finalized")
        )
      );
    }

    closeLoading();
    updatePage();
  } catch (error) {
    closeLoading();
    console.log("Error-----", error);
  }
};

export const mutNftFromWalletTx = async (
  wallet: WalletContextState,
  mint: PublicKey,
  juicingProgram: Program
) => {
  if (!wallet.publicKey) return;

  let transactions: Transaction[] = [];

  const [juicingGlobal, juicingBump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgram.programId
  );
  console.log("JuicingGlobalAuthority: ", juicingGlobal.toBase58());

  const [nftPoolKey, nftBump] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), mint.toBuffer()],
    juicingProgram.programId
  );
  console.log("nftPoolKey: ", nftPoolKey.toBase58());

  let nftPoolAccount = await solConnection.getAccountInfo(nftPoolKey);
  // console.log("nftPoolAccout", nftPoolAccount);
  if (nftPoolAccount === null || nftPoolAccount.data === null) {
    console.log("Creating NFT Pool...");
    const tx = await initNftPoolTx(wallet, mint, juicingProgram);
    if (tx) transactions.push(tx);
  }

  let newNftMint;

  for (let i = 0; i < corresponding.length; i++) {
    if (corresponding[i].oldPubkey === mint.toString()) {
      newNftMint = corresponding[i].newPubkey;
      break;
    }
    continue;
  }

  if (newNftMint === undefined) {
    console.log("No matching NFT");
    return;
  }

  // let stakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, mint);
  let oldNftAta = await getATokenAccountsNeedCreate(
    solConnection,
    wallet.publicKey,
    wallet.publicKey,
    [mint]
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
  console.log("NFTVault >>", nftVault.destinationAccounts[0].toBase58());

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
    [mint]
  );
  console.log("BurnAccout", burnAccount.destinationAccounts[0].toBase58());

  const oldMetadata = await getMetadata(mint);
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

  if (nftVault.instructions.length > 0) tx.add(...nftVault.instructions);
  console.log("##NFT Vault Ix = ", nftVault.instructions[0]);
  if (oldNftAta.instructions.length > 0) tx.add(...oldNftAta.instructions);
  console.log("##Old NFT ATA Ix = ", oldNftAta.instructions[0]);
  if (newNftAta.instructions.length > 0) tx.add(...newNftAta.instructions);
  console.log("##New NFT ATA Ix = ", newNftAta.instructions[0]);
  if (burnAccount.instructions.length > 0) tx.add(...burnAccount.instructions);
  console.log("##Burn Account Ix = ", burnAccount.instructions[0]);

  tx.add(
    juicingProgram.instruction.nftToMutable(juicingBump, nftBump, newNftId, {
      accounts: {
        owner: wallet.publicKey,
        nftMint: mint,
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

  transactions.push(tx);
  return transactions;
};

export const nftToMutable = async (
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

  const juicingProgram = new anchor.Program(
    JUICEIDL as anchor.Idl,
    JUICING_PROGRAM_ID,
    provider
  );

  try {
    startLoading();
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
    console.log("NFTVault >>", nftVault.destinationAccounts[0].toBase58());

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

    if (nftVault.instructions.length > 0) tx.add(...nftVault.instructions);
    console.log("##NFT Vault Ix = ", nftVault.instructions[0]);
    if (oldNftAta.instructions.length > 0) tx.add(...oldNftAta.instructions);
    console.log("##Old NFT ATA Ix = ", oldNftAta.instructions[0]);
    if (newNftAta.instructions.length > 0) tx.add(...newNftAta.instructions);
    console.log("##New NFT ATA Ix = ", newNftAta.instructions[0]);
    if (burnAccount.instructions.length > 0)
      tx.add(...burnAccount.instructions);
    console.log("##Burn Account Ix = ", burnAccount.instructions[0]);

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

export const mutAllNftFromBootcamp = async (
  wallet: WalletContextState,
  stakedNftMints: PublicKey[],
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

    let transactions: Transaction[] = [];

    for (let mint of stakedNftMints) {
      const txs = await mutFromBootcampTx(
        wallet,
        mint,
        program,
        juicingProgram,
        closeLoading
      );
      if (txs) transactions.push(...txs);
    }

    let { blockhash } = await provider.connection.getLatestBlockhash(
      "confirmed"
    );

    transactions.forEach((transaction) => {
      transaction.feePayer = wallet.publicKey as PublicKey;
      transaction.recentBlockhash = blockhash;
    });

    if (wallet.signAllTransactions !== undefined) {
      const signedTransactions = await wallet.signAllTransactions(transactions);

      let signatures = await Promise.all(
        signedTransactions.map(
          (transaction) =>
            provider.connection.sendRawTransaction(transaction.serialize(), {
              skipPreflight: true,
              maxRetries: 3,
              preflightCommitment: "confirmed",
            })
          // wallet.sendTransaction(transaction, provider.connection, {maxRetries: 3, preflightCommitment: 'confirmed'})
        )
      );

      console.log("Your transaction signatures", signatures);
      await Promise.all(
        signatures.map((signature) =>
          provider.connection.confirmTransaction(signature, "finalized")
        )
      );
    }

    closeLoading();
    updatePage();
  } catch (error) {
    closeLoading();
    console.log("Error-----", error);
  }
};

export const mutFromBootcampTx = async (
  wallet: WalletContextState,
  stakedNftMint: PublicKey,
  program: Program,
  juicingProgram: Program,
  closeLoading: Function
) => {
  if (!wallet.publicKey) return;

  let transactions: Transaction[] = [];

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const [juicingGlobal, juicingBump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgram.programId
  );

  let userPoolKey = await PublicKey.createWithSeed(
    wallet.publicKey,
    "user-pool",
    program.programId
  );

  let poolAccount = await solConnection.getAccountInfo(userPoolKey);
  if (poolAccount === null || poolAccount.data === null) {
    // console.log("Creating UserPool Account...");
    const tx = await initUserPoolTx(wallet, program);
    if (tx) transactions.push(tx);
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
    const tx = await initNftPoolTx(wallet, stakedNftMint, juicingProgram);
    if (tx) transactions.push(tx);
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

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
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

  transactions.push(tx);
  return transactions;
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

    let userPoolKey = await PublicKey.createWithSeed(
      wallet.publicKey,
      "user-pool",
      program.programId
    );

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

export const initNftPoolTx = async (
  wallet: WalletContextState,
  mint: PublicKey,
  juicingProgram: Program
) => {
  if (!wallet.publicKey) return;

  let tx = new Transaction();

  const [nftPoolKey, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), mint.toBuffer()],
    juicingProgram.programId
  );

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

  return tx;
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
  try {
    let tx = await initNftPoolTx(wallet, mint, juicingProgram);

    if (!tx) return;
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

export const initUserPoolTx = async (
  wallet: WalletContextState,
  juicingProgram: Program
) => {
  if (!wallet.publicKey) return;

  let tx = new Transaction();

  const [userPoolKey, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_USER_POOL_SEED), wallet.publicKey.toBuffer()],
    juicingProgram.programId
  );

  tx.add(
    juicingProgram.instruction.initializeUserPool(bump, {
      accounts: {
        owner: wallet.publicKey,
        userPool: userPoolKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    })
  );

  return tx;
};

export const initUserPool = async (wallet: WalletContextState) => {
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
  try {
    let tx = await initUserPoolTx(wallet, juicingProgram);

    if (!tx) return;
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

export const rebirthNft = async (
  wallet: WalletContextState,
  mutatedNftMint: PublicKey,
  newMetaLink: string,
  rebirthMetaLink: string,
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

  const juicingProgram = new anchor.Program(
    JUICEIDL as anchor.Idl,
    JUICING_PROGRAM_ID,
    provider
  );

  try {
    startLoading();
    const [juicingGlobal] = await PublicKey.findProgramAddress(
      [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
      juicingProgram.programId
    );
    console.log("JuicingGlobalAuthority: ", juicingGlobal.toBase58());

    const [solVault] = await PublicKey.findProgramAddress(
      [Buffer.from(JUICING_SOL_VAULT_SEED)],
      juicingProgram.programId
    );
    console.log("JuicingSolVault: ", solVault.toBase58());

    const [userPoolKey] = await PublicKey.findProgramAddress(
      [Buffer.from(JUICING_USER_POOL_SEED), wallet.publicKey.toBuffer()],
      juicingProgram.programId
    );
    console.log("User Pool: ", userPoolKey.toBase58());

    let poolAccount = await solConnection.getAccountInfo(userPoolKey);
    if (poolAccount === null || poolAccount.data === null) {
      console.log("Creating UserPool Account...");
      await initUserPool(wallet);
    }

    const [nftPoolKey] = await PublicKey.findProgramAddress(
      [Buffer.from(NFT_POOL_SEED), mutatedNftMint.toBuffer()],
      juicingProgram.programId
    );
    console.log("nftPoolKey: ", nftPoolKey.toBase58());

    let nftPoolAccount = await solConnection.getAccountInfo(nftPoolKey);
    // console.log("nftPoolAccout", nftPoolAccount);
    if (nftPoolAccount === null || nftPoolAccount.data === null) {
      console.log("Creating NFT Pool...");
      await initNftPool(wallet, mutatedNftMint);
    }

    console.log("NewMetadataURI:", rebirthMetaLink);

    // let stakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, mutatedNftMint);
    // let oldNftAta = await getATokenAccountsNeedCreate(
    //   solConnection,
    //   wallet.publicKey,
    //   wallet.publicKey,
    //   [mutatedNftMint]
    // );
    // console.log("stakedATA", oldNftAta.destinationAccounts[0].toBase58());

    // let newStakedTokenAccount = await getAssociatedTokenAccount(globalAuthority, new PublicKey(newNftMint));
    // let newNftAta = await getATokenAccountsNeedCreate(
    //   solConnection,
    //   wallet.publicKey,
    //   wallet.publicKey,
    //   [new PublicKey(newNftMint)]
    // );
    // console.log("NewNftATA >>", newNftAta.destinationAccounts[0].toBase58());

    // let nftVault = await getATokenAccountsNeedCreate(
    //   solConnection,
    //   wallet.publicKey,
    //   juicingGlobal,
    //   [new PublicKey(newNftMint)]
    // );
    // console.log("NFTVault >>", nftVault.destinationAccounts[0].toBase58());

    // let newNftAccount = await solConnection.getAccountInfo(
    //   nftVault.destinationAccounts[0]
    // );
    // if (newNftAccount == null) {
    //   console.log("No NFT in the NFT Vault!");
    //   return;
    // }

    // let burnAccount = await getATokenAccountsNeedCreate(
    //   solConnection,
    //   wallet.publicKey,
    //   BURN_WALLET_ADDRESS,
    //   [mutatedNftMint]
    // );
    // console.log("BurnAccout", burnAccount.destinationAccounts[0].toBase58());

    const newMetadata = await getMetadata(mutatedNftMint);
    // const newMetadata = await getMetadata(new PublicKey(newNftMint));
    //Another method that can be used to fetch address of the metadata account is as bellows
    // const metadataAccount = await Metadata.getPDA(new PublicKey(newNftAddress));

    let {
      metadata: { Metadata },
    } = programs;
    const metadata = await Metadata.load(solConnection, newMetadata);
    let updateAuthority = metadata.data.updateAuthority;

    console.log("Owner: ", wallet.publicKey.toBase58());

    let tx = new Transaction();

    tx.add(
      juicingProgram.instruction.juicingNft(rebirthMetaLink, {
        accounts: {
          payer: wallet.publicKey,
          owner: wallet.publicKey,
          userPool: userPoolKey,
          nftMint: mutatedNftMint,
          nftPool: nftPoolKey,
          globalAuthority: juicingGlobal,
          solVault,
          // userTokenAccount: oldNftAta.destinationAccounts[0],
          // newUserTokenAccount: newNftAta.destinationAccounts[0],
          // nftVault: nftVault.destinationAccounts[0],
          // burnAccount: burnAccount.destinationAccounts[0],
          mintMetadata: newMetadata,
          updateAuthority,
          tokenMetadataProgram: METAPLEX,
          systemProgram: SystemProgram.programId,
        },
        instructions: [],
      })
    );
    let { blockhash } = await provider.connection.getLatestBlockhash(
      "confirmed"
    );
    tx.feePayer = wallet.publicKey as PublicKey;
    tx.recentBlockhash = blockhash;

    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = tx.serialize({
      // We will need the buyer to sign this transaction after it's returned to them
      requireAllSignatures: false,
    });
    const base64 = serializedTransaction.toString("base64");

    const partialSignedTx = await fetch(JUICING_BACKEND_API_URL + "", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tx: base64 }),
    })
      .then((res) => {
        console.log("Response received");
        if (res.status === 200) {
          return res.json();
        }
        return { err: `Internal server error: ${res.status}` };
      })
      .catch((e) => {
        throw e.message || e.msg || JSON.stringify(e);
      });
    if (partialSignedTx.err) throw partialSignedTx.err;

    // Deserialize the transaction from the response
    const decodedTx = Transaction.from(Buffer.from(partialSignedTx, "base64"));
    if (decodedTx.instructions[0].keys.length > 4)
      console.log(
        "NftMint:",
        decodedTx.instructions[0].keys[3].pubkey.toBase58()
      );

    if (wallet.signTransaction !== undefined) {
      const signedTransaction = await wallet.signTransaction(decodedTx);
      console.log(
        "Signed",
        signedTransaction.signatures.map((sig) => sig.publicKey.toBase58())
      );
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

export const allNftToRebirth = async (
  wallet: WalletContextState,
  mints: PublicKey[],
  startLoading: Function,
  closeLoading: Function,
  updatePage: Function
) => {
  if (!wallet.publicKey || !wallet.signAllTransactions) return;

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

  try {
    startLoading();
    let preTransactions: Transaction[] = [];
    let transactions: Transaction[] = [];

    const [userPoolKey] = await PublicKey.findProgramAddress(
      [Buffer.from(JUICING_USER_POOL_SEED), wallet.publicKey.toBuffer()],
      juicingProgram.programId
    );
    console.log("User Pool: ", userPoolKey.toBase58());

    let poolAccount = await solConnection.getAccountInfo(userPoolKey);
    if (poolAccount === null || poolAccount.data === null) {
      console.log("Creating UserPool Account...");
      await initUserPool(wallet);
    }

    for (let mint of mints) {
      const txs = await rebirthNftFromWalletTx(
        wallet,
        userPoolKey,
        mint,
        juicingProgram
      );
      if (txs) {
        if (txs.length > 1) {
          preTransactions.push(txs[0]);
          transactions.push(txs[1]);
        } else {
          transactions.push(...txs);
        }
      }
    }

    // Send preTransactions for Nft Pool creation
    if (preTransactions.length > 0) {
      console.log("////////// Sending all InitNftPool Txs");

      let { blockhash } = await provider.connection.getLatestBlockhash(
        "confirmed"
      );

      preTransactions.forEach((transaction) => {
        transaction.feePayer = wallet.publicKey as PublicKey;
        transaction.recentBlockhash = blockhash;
      });

      const signedTransactions = await wallet.signAllTransactions(
        preTransactions
      );

      let signatures = await Promise.all(
        signedTransactions.map(
          (transaction) =>
            provider.connection.sendRawTransaction(transaction.serialize(), {
              skipPreflight: true,
              maxRetries: 3,
              preflightCommitment: "confirmed",
            })
          // wallet.sendTransaction(transaction, provider.connection, {maxRetries: 3, preflightCommitment: 'confirmed'})
        )
      );

      console.log("Your transaction signatures", signatures);
      await Promise.all(
        signatures.map((signature) =>
          provider.connection.confirmTransaction(signature, "finalized")
        )
      );

      console.log("////////// Successfully sent all InitNftPool Txs");
    }

    let { blockhash } = await provider.connection.getLatestBlockhash(
      "confirmed"
    );

    await Promise.all(
      transactions.map((transaction, index) => {
        return new Promise(async (resolve, reject) => {
          try {
            transaction.feePayer = wallet.publicKey as PublicKey;
            transaction.recentBlockhash = blockhash;

            // Serialize the transaction and convert to base64 to return it
            const serializedTransaction = transaction.serialize({
              // We will need the buyer to sign this transaction after it's returned to them
              requireAllSignatures: false,
            });
            const base64 = serializedTransaction.toString("base64");

            const partialSignedTx = await fetch(JUICING_BACKEND_API_URL + "", {
              method: "POST",
              headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ tx: base64 }),
            })
              .then((res) => {
                console.log("Response received");
                if (res.status === 200) {
                  return res.json();
                }
                return { err: `Internal server error: ${res.status}` };
              })
              .catch((e) => {
                throw e.message || e.msg || JSON.stringify(e);
              });
            if (partialSignedTx.err) throw partialSignedTx.err;

            // Deserialize the transaction from the response
            const decodedTx = Transaction.from(
              Buffer.from(partialSignedTx, "base64")
            );
            if (decodedTx.instructions[0].keys.length > 4)
              console.log(
                "NftMint:",
                decodedTx.instructions[0].keys[3].pubkey.toBase58()
              );

            transactions[index] = decodedTx;
            resolve({});
          } catch (e) {
            reject(e);
          }
        });
      })
    );

    const signedTransactions = await wallet.signAllTransactions(transactions);

    let signatures = await Promise.all(
      signedTransactions.map(
        (transaction) =>
          provider.connection.sendRawTransaction(transaction.serialize(), {
            skipPreflight: true,
            maxRetries: 3,
            preflightCommitment: "confirmed",
          })
        // wallet.sendTransaction(transaction, provider.connection, {maxRetries: 3, preflightCommitment: 'confirmed'})
      )
    );

    console.log("Your transaction signatures", signatures);
    await Promise.all(
      signatures.map((signature) =>
        provider.connection.confirmTransaction(signature, "finalized")
      )
    );

    closeLoading();
    updatePage();
  } catch (error) {
    closeLoading();
    console.log("Error-----", error);
  }
};

export const rebirthNftFromWalletTx = async (
  wallet: WalletContextState,
  userPoolKey: PublicKey,
  mint: PublicKey,
  juicingProgram: Program
) => {
  if (!wallet.publicKey) return;

  let rebirthMetaLink = undefined;
  for (let i = 0; i < corresponding.length; i++) {
    if (corresponding[i].newPubkey === mint.toString()) {
      rebirthMetaLink = corresponding[i].rebirthMetaLink;
      break;
    }
    continue;
  }

  console.log("NewMetadataURI:", rebirthMetaLink);
  if (!rebirthMetaLink) return;

  let transactions: Transaction[] = [];
  const [juicingGlobal] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_GLOBAL_AUTHORITY_SEED)],
    juicingProgram.programId
  );
  console.log("JuicingGlobalAuthority: ", juicingGlobal.toBase58());

  const [solVault] = await PublicKey.findProgramAddress(
    [Buffer.from(JUICING_SOL_VAULT_SEED)],
    juicingProgram.programId
  );
  console.log("JuicingSolVault: ", solVault.toBase58());

  const [nftPoolKey] = await PublicKey.findProgramAddress(
    [Buffer.from(NFT_POOL_SEED), mint.toBuffer()],
    juicingProgram.programId
  );
  console.log("nftPoolKey: ", nftPoolKey.toBase58());

  let nftPoolAccount = await solConnection.getAccountInfo(nftPoolKey);
  // console.log("nftPoolAccout", nftPoolAccount);
  if (nftPoolAccount === null || nftPoolAccount.data === null) {
    console.log("Creating NFT Pool...");
    const tx = await initNftPoolTx(wallet, mint, juicingProgram);
    if (tx) transactions.push(tx);
  }

  const newMetadata = await getMetadata(mint);
  let {
    metadata: { Metadata },
  } = programs;
  const metadata = await Metadata.load(solConnection, newMetadata);
  let updateAuthority = metadata.data.updateAuthority;

  console.log("Owner: ", wallet.publicKey.toBase58());

  let tx = new Transaction();

  tx.add(
    juicingProgram.instruction.juicingNft(rebirthMetaLink, {
      accounts: {
        payer: wallet.publicKey,
        owner: wallet.publicKey,
        userPool: userPoolKey,
        nftMint: mint,
        nftPool: nftPoolKey,
        globalAuthority: juicingGlobal,
        solVault,
        mintMetadata: newMetadata,
        updateAuthority,
        tokenMetadataProgram: METAPLEX,
        systemProgram: SystemProgram.programId,
      },
      instructions: [],
    })
  );

  transactions.push(tx);
  return transactions;
};
