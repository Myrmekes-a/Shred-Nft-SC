import { Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { Signer, Transaction, Keypair, Connection } from "@solana/web3.js";

import fs from "fs";

const SOLANA_MAINNET =
  "https://nameless-cool-hill.solana-mainnet.quiknode.pro/8573940e7f293a749e9775b61efc3814c9ff25eb/";
const solConnection = new Connection(SOLANA_MAINNET, "confirmed");

console.log(
  process.env.UPDATE_AUTHORITY
    ? "Update Authority wallet loaded"
    : "ENV not loaded"
);

const wallet = new anchor.Wallet(
  Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.UPDATE_AUTHORITY!)),
    { skipValidation: true }
  )
);
const provider = new anchor.AnchorProvider(solConnection, wallet, {});
anchor.setProvider(provider);
const payer = wallet;

const PROGRAM_ID = "6UGs1n5peX4pYhwRofoDvtVaz8sToP8kByU24576wQt4";

// let program: Program = null;

// // Configure the client to use the local cluster.
// const idl = JSON.parse(
//   fs.readFileSync(__dirname + "/juiced_ape_evolution.json", "utf8")
// );

// // Address of the deployed program.
// const programId = new anchor.web3.PublicKey(PROGRAM_ID);

// // Generate the program client from IDL.
// program = new anchor.Program(idl, programId);
// console.log("ProgramId: ", program.programId.toBase58());

export const rebirthTxSign = async (
  encodedTx: string // Encoded transaction
) => {
  console.log("Update Authority", payer.publicKey.toBase58());

  // Deserialize the transaction from the response
  const transaction = Transaction.from(Buffer.from(encodedTx, "base64"));
  if (transaction.instructions[0].keys.length > 4)
    console.log(
      "NftMint:",
      transaction.instructions[0].keys[3].pubkey.toBase58()
    );
  transaction.partialSign((payer as NodeWallet).payer as Signer);

  // Serialize the transaction and convert to base64 to return it
  const serializedTransaction = transaction.serialize({
    // We will need the buyer to sign this transaction after it's returned to them
    requireAllSignatures: false,
  });

  const base64 = serializedTransaction.toString("base64");

  return base64;
};
