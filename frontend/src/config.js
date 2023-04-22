import { web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

// export const PROGRAM_ID = "9F8CKAQSFNjRYpKifAshJJfTC5dT9uqg3MvVVdWvcBRE";

export const GLOBAL_AUTHORITY_SEED = "global-authority";

// export const APE_CREATOR = "69JUqMCBEyKBppr4zwGAM9HTQ8JtUwWE2vdQQShWQExH";
// export const APE_CREATOR = "E5GSUDTQAvJouZkxHFGMA3THVzXWvrs4hRZEag2au3k6";
export const APE_CREATOR = "36MrAKpGGp8ysANfTNCUswCH2qdCAmGy3pTdd8Ts8vCH";
export const DIAMOND_CREATOR = "Fg8CkttGq4jvgPYqeE7LLVmt3EwzsefGxnyvhJuXbiy7";
export const PUBLISH_NETWORK = "mainnet";

export const USER_POOL_SIZE = 4864; // 8 + 4856
export const JUICING_GLOBAL_AUTHORITY_SEED = "juicing-global-authority";
export const JUICING_SOL_VAULT_SEED = "sol-vault";
export const JUICING_USER_POOL_SEED = "user-pool";

export const BURN_WALLET_ADDRESS = new PublicKey(
  "4XX1K7KWAM4KrNovEPazunXEiLNvdcyTp1abs8Snz5Ug"
);
export const IMMUTABLE_COLLECTION =
  "36MrAKpGGp8ysANfTNCUswCH2qdCAmGy3pTdd8Ts8vCH";

export const MUTABLE_COLLECTION =
  "3eTprkijjwjx1jd17UrVHzr6GnQqf3mtV3FXqZj16fVL";
export const REWARD_TOKEN_MINT = new PublicKey(
  "Ue4yjkPjA4QGis37eWbBsnqfzyK83BtY4AioDETp3Ab"
);
// export const REWARD_TOKEN_MINT = new PublicKey(
//   "CFt8zQNRUpK4Lxhgv64JgZ5giZ3VWXSceQr6yKh7VoFU"
// );
export const PROGRAM_ID = "5Q5FXSHTABC4URi6KUxT9auirRxo86GukRAYBK7Jweo4";
export const JUICING_PROGRAM_ID =
  "6UGs1n5peX4pYhwRofoDvtVaz8sToP8kByU24576wQt4";

export const DECIMALS = 1_000_000;
export const EPOCH = 1; // 86400 - 1 day
export const FACTOR = 125; // X 1.25 Reward
export const NORMAL_REWARD_AMOUNT = 116; // 10 $WHEY
export const LEGENDARY_REWARD_AMOUNT = 289; // 25 $WHEY
export const DIAMOND_REWARD_AMOUNT = 348; // 30 $WHEY

export const SHOW_REWARD_FIXED = 4;

///------- bootcamp ---------///
export const BOOTCAMP_PROGRAM_ID =
  "CTniA9cmfobHRaTq8cBawE9Z9VwYAA1ifgRXMGZxVRfc";
export const BOOTCAMP_USER_POOL_SIZE = 5688; // 8 + 5680

export const TIER1_FACTOR = 150; // X 1.5 Reward
export const TIER2_FACTOR = 175; // X 1.75 Reward
export const TIER3_FACTOR = 200; // X 2.0 Reward

// export const solConnection = new web3.Connection(web3.clusterApiUrl("devnet"));
// export const solConnection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
// export const solConnection = new web3.Connection(
//   " https://ssc-dao.genesysgo.net/"
// );
// export const solConnection = new web3.Connection("https://rpc.ankr.com/solana");
// export const solConnection = new web3.Connection("https://api.metaplex.solana.com/");
// export const solConnection = new web3.Connection("https://slope.rpcpool.com/");
// export const solConnection = new web3.Connection("https://solana-mainnet.phantom.tech/");
// export const solConnection = new web3.Connection("https://mainnet-beta.solflare.network");
// export const solConnection = new web3.Connection("https://a2-mind-prd-api.azurewebsites.net/rpc");
export const solConnection = new web3.Connection(
  "https://nameless-cool-hill.solana-mainnet.quiknode.pro/8573940e7f293a749e9775b61efc3814c9ff25eb/"
);
export const METAPLEX = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// export const SHRED_BACKEND_API_URL = "https://sagc-holders-api.herokuapp.com";
export const SHRED_BACKEND_API_URL = "https://api-fixstaking.vercel.app/";
export const JUICING_BACKEND_API_URL =
  "https://juicing-sign-backend.vercel.app/";
