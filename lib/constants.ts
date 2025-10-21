import { PublicKey, Connection, Commitment } from "@solana/web3.js";

// ===== NETWORK CONFIGURATION =====
export const SOLANA_NETWORK = "devnet";
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
export const COMMITMENT_LEVEL: Commitment = "confirmed";

// API keys - prefer environment variables, fallback to empty string
export const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "";

// Create Solana connection
export const getSolanaConnection = () => new Connection(SOLANA_RPC_URL, COMMITMENT_LEVEL);

// ===== PROGRAM IDs =====
export const SWAP_PROGRAM_ID = new PublicKey("7VFS76Bvrfj35GDho97B8HxgToW9Rpk6zLnx1VwwJhKD");
export const AMM_PDA = new PublicKey("4ZnuhoWp9csaEm8LZeeNgbgXQ6tHoz4yTw3feA6DiH1e");

// ===== VAULT PROGRAM =====
export const VAULT_PROGRAM_ID = new PublicKey("FjJCYKXSdtdqQcfJBZnofj2s3vxSR9dSHUdLTDSeBrLA");
export const VAULT_PDA = new PublicKey("76TtBHwQT6H3PrGYW7idRvzcApQBmGSxJQGBYFJpvark");

// ===== TOKEN CONFIGURATION =====
export const TOKEN_DECIMALS = 3;
export const DECIMAL_MULTIPLIER = Math.pow(10, TOKEN_DECIMALS);

// ===== BASE TOKEN (BOSON) =====
// Deployed BOSON mint address - update if you have a different base token
export const BOSON_MINT = new PublicKey("HtnUp4FXaKC7MvpWP2N8W25rea75XspMiiw3XEixE8Jd");

export const BOSON_TOKEN = {
  name: "BOSON",
  mint: BOSON_MINT,
  displayName: "BOSON",
  team: "Base",
  position: "Base" as const,
  avatar: "B",
  imageUrl: "", // Base token, no player image
};

// ===== TRADING CONFIGURATION =====
export const SLIPPAGE_TOLERANCE = 0.9; // 10% slippage (99.5% = 0.5% slippage)

// ===== PLAYER TYPES =====
export type PlayerPosition = "BAT" | "BWL" | "AR" | "WK";

export interface PlayerInfo {
  displayName: string;
  name: string;
  team: string;
  position: PlayerPosition;
  avatar: string;
  imageUrl: string;
  mint: PublicKey; // Solana token mint address
}

// ===== PLAYER TOKEN MINTS AND POOL ADDRESSES =====
// Deployed on Solana devnet
const PLAYER_MINTS = {
  BenStokes: "5qBqQyobhK9rMYcK5PnwmWUY2GYpuVeqHfPpu4mAJ3rD",
  TravisHead: "2yqdx8tQukCHHJiCUsNKGq1mXA9BEmkxSGiouE3u9SSV",
  GlenMaxwell: "6mWJRGNUnjbvoqVmP5UoPRYUK7t4zrBiUY4pHBKrbuK8",
  ShubhamDube: "By8cEkVw6wNw4uJWb5PFNS6PyYma2wXZz49ZB6jeJhKo",
  HardikPandya: "7o6rdp5eabo3xhAq9Roqh46aaGDygevrttmMiNgDHcgJ",
  ShubhmanGill: "Az2cZgMbBUorGDZe9EUUx2pxzCenmzC3iEysqz31Ma8a",
  KaneWilliamson: "A8VE2H3X862wRA2YbZKto3STPXx8hcWAg6pbe41UbGCo",
  AbhishekSharma: "2v49DpyAKD8mxebQ2jes4RvidoybZzfDVRg29vL5yZNL",
  JaspreetBumhrah: "9CLC1mmqKxqYSaN7ywgKKwDdxWqUJFqr8KWeuDikW2TN",
  SuryakumarYadav: "6AgRnebp5spiBr4VXxJRcYMrjozturT1feLPSTx79kpT",
  ViratKohli: "5FhMPnCjrTT56gZfGb7TAupCnRVPpkRZAhG8xkrLfGos",
  JoeRoot: "3oDpdwng8fvWFhCUpDzvvt6xeee4WHsDozqb2QJLiLGX",
  HarryBrook: "4gfPzmZSneYdN1UwTTNJA4jKLyf4DQ5mcxcsPSoUy9b2",
  YashasviJaiswal: "7VTyZcWcdeWZBPEcLzEodsGRWruvSWzTS8cT6HQKoBK9",
  RishabhPant: "CuBFQd57LgfHikAdTVnQrgnFdrsseF78xnrnKVjDoX4z",
  RohitSharma: "4pc1TzZM2o5yxATMbQPuzBRVMqf8VtMh3kugPai1iVGm",
  KLRahul: "CiYbhHcUcFn14EJLJzFj1jnbjaw3e5MZQoVfBPdFH4Tr",
  JosButtler: "3g57ThxyBLzekz6wYZDpx93Kp96R8bbkmbKX3JQah1L4",
  JoshInglis: "9e3A3uPRxjVtdy8i3J3vF84rRURS4mj9JipkRRrxRvya",
  WashingtonSundar: "FUFyqx1DBK9TkMtmuwkcQqetvrb3nx67YtVbgBi9MzGB",
  ShaiHope: "21pYFJLWdStBa9qB2QhgDD49iJXNqSxgnN19qduuR1GK",
  JohnCampbell: "8cpq5bWEoMYghki8D7DyJ25NaD6cjuSnJtbR3tWCeCfh",
  KharyPierre: "7uQQwoYigCfvh18rdbSqixbJ8imQV2b6ou3MTwrzmH5a",
  MohammedSiraj: "253unST1UwE1Ykg3BWF68iGajhzAkajzQKNQU4QueR2P",
  AlickAthanaze: "9LS4Prb6wS8TpjjztkWVRG2k81NPbpuhwZEXcv1qff43",
};

export const POOL_ADDRESSES = {
  BenStokes: "JDD9WuLPq234fFRSPZqmUySaF8ie3PDFDQNgJg2Y9J7T",
  TravisHead: "C8mafYpr8jonN5chS9pxix3cMWBEfgJ2YQxgGssiXoP5",
  GlenMaxwell: "4NjCSE89Pyq1cdWfygtXoj1YukDu8kPRXr31cB8Pud8e",
  ShubhamDube: "BwrRH1WZsSH1MdHzpAeErGCp8bkXtp3GQWCwwRhzuBwe",
  HardikPandya: "Cb7dSXQE7ZnzhGR7t3u4fGfM9jHL67XXnpgukMB4ZVuS",
  ShubhmanGill: "DKyPdCj9whq8MduqiNUcM9xVAsoWR89jAsdUFhRUsetJ",
  KaneWilliamson: "8R8yWsHRP3CXLDNf633hBrw2PyFoNJz2Q8SrT24JXxor",
  AbhishekSharma: "BhCEGn2mpaBGU3sD6Ma5rPfFuoHeJC2554JCpLtg9H3u",
  JaspreetBumhrah: "9eMF3Bzq4dJ5teoo5GBYM45xrKZ26MkMhiuzWrUdJWpc",
  SuryakumarYadav: "EnEyhg12Cm6NPvr4jbVtYCpv5snGZCF4bWmRdaC7rvNJ",
  ViratKohli: "DdkpLNQ1S2SwoWgvajHvQHkraYBLk6q8sfSBrguckFxz",
  JoeRoot: "3B2UiTvsxQDF3t96UHhS9upHQ4WtjbzkHH26vGDLd7hg",
  HarryBrook: "9UWymQ4XLaCuyZpuxjup36z2FmZ1dsRSfXYNvLwSqAcG",
  YashasviJaiswal: "Bxdq1cGXVj9NNzbak3vVDYqAu3cjjzPuKEVhVNzA3WRi",
  RishabhPant: "EaZ9m6p2wa8ZKkkq7SaBpCz4uaAS4SdsrqgUgeJYcyKW",
  RohitSharma: "CFeJ9t2cMkUW7WNEyeQyriFjjd4xvpV6z36rw6YRepcF",
  KLRahul: "6exJH9dLUXTVBLMrZ9hoAvynbBNYhreSNKMMLHhrbesW",
  JosButtler: "4YgXZzaWJohMaZ8dJJaWVBibEG3J5txX9A5YJ4Q49W1E",
  JoshInglis: "Dmbi9NfSAXMEmTdBvmCkX5UAUa5kSE6wWseEPpUCD15E",
  WashingtonSundar: "AxkmS9mFsf1dEN3fENWQW1UYEuPcQ1BG2tUd1qqLG3bj",
  ShaiHope: "26K4GTuhGEFFmwwXpNfiwxc6b8xSmgSkAB6XpWYkpYzH",
  JohnCampbell: "BCvQHZDNCZUojZuszFy8kumkg1W3Hjnfs5eXJtqL9nRR",
  KharyPierre: "BrMpcXBEGs4CStAQLC1QegkkWuyduQKDLFq5VsKtCPZL",
  MohammedSiraj: "GBN2YumWRGAPAwZbywd2Q5txpRgwpLn7MB5FqLD86rCP",
  AlickAthanaze: "3skaq6tdwJsF8k4Q7yHeCyUZ75wR7K9DsqoHHLoBiDeL",
};

// ===== PLAYER MAPPING =====
export const PLAYER_MAPPING: Record<string, PlayerInfo> = {
  BenStokes: {
    displayName: "Ben Stokes",
    name: "Ben Stokes",
    team: "ENG",
    position: "AR",
    avatar: "BS",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=BenStokes",
    mint: new PublicKey(PLAYER_MINTS.BenStokes),
  },
  TravisHead: {
    displayName: "Travis Head",
    name: "Travis Head",
    team: "AUS",
    position: "BAT",
    avatar: "TH",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=TravisHead",
    mint: new PublicKey(PLAYER_MINTS.TravisHead),
  },
  ViratKohli: {
    displayName: "Virat Kohli",
    name: "Virat Kohli",
    team: "IND",
    position: "BAT",
    avatar: "VK",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=ViratKohli",
    mint: new PublicKey(PLAYER_MINTS.ViratKohli),
  },
  GlenMaxwell: {
    displayName: "Glenn Maxwell",
    name: "Glenn Maxwell",
    team: "AUS",
    position: "AR",
    avatar: "GM",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=GlennMaxwell",
    mint: new PublicKey(PLAYER_MINTS.GlenMaxwell),
  },
  ShubhamDube: {
    displayName: "Shubham Dube",
    name: "Shubham Dube",
    team: "IND",
    position: "AR",
    avatar: "SD",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=ShubhamDube",
    mint: new PublicKey(PLAYER_MINTS.ShubhamDube),
  },
  HardikPandya: {
    displayName: "Hardik Pandya",
    name: "Hardik Pandya",
    team: "IND",
    position: "AR",
    avatar: "HP",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=HardikPandya",
    mint: new PublicKey(PLAYER_MINTS.HardikPandya),
  },
  ShubhmanGill: {
    displayName: "Shubman Gill",
    name: "Shubman Gill",
    team: "IND",
    position: "BAT",
    avatar: "SG",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=ShubmanGill",
    mint: new PublicKey(PLAYER_MINTS.ShubhmanGill),
  },
  KaneWilliamson: {
    displayName: "Kane Williamson",
    name: "Kane Williamson",
    team: "NZ",
    position: "BAT",
    avatar: "KW",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=KaneWilliamson",
    mint: new PublicKey(PLAYER_MINTS.KaneWilliamson),
  },
  AbhishekSharma: {
    displayName: "Abhishek Sharma",
    name: "Abhishek Sharma",
    team: "IND",
    position: "BAT",
    avatar: "AS",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=AbhishekSharma",
    mint: new PublicKey(PLAYER_MINTS.AbhishekSharma),
  },
  JaspreetBumhrah: {
    displayName: "Jasprit Bumrah",
    name: "Jasprit Bumrah",
    team: "IND",
    position: "BWL",
    avatar: "JB",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=JaspritBumrah",
    mint: new PublicKey(PLAYER_MINTS.JaspreetBumhrah),
  },
  SuryakumarYadav: {
    displayName: "Suryakumar Yadav",
    name: "Suryakumar Yadav",
    team: "IND",
    position: "BAT",
    avatar: "SY",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=SuryakumarYadav",
    mint: new PublicKey(PLAYER_MINTS.SuryakumarYadav),
  },
  JoeRoot: {
    displayName: "Joe Root",
    name: "Joe Root",
    team: "ENG",
    position: "BAT",
    avatar: "JR",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=JoeRoot",
    mint: new PublicKey(PLAYER_MINTS.JoeRoot),
  },
  KLRahul: {
    displayName: "KL Rahul",
    name: "KL Rahul",
    team: "IND",
    position: "WK",
    avatar: "KLR",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=KLRahul",
    mint: new PublicKey(PLAYER_MINTS.KLRahul),
  },
  ShaiHope: {
    displayName: "Shai Hope",
    name: "Shai Hope",
    team: "WI",
    position: "WK",
    avatar: "SH",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=ShaiHope",
    mint: new PublicKey(PLAYER_MINTS.ShaiHope),
  },
  HarryBrook: {
    displayName: "Harry Brook",
    name: "Harry Brook",
    team: "ENG",
    position: "BAT",
    avatar: "HB",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=HarryBrook",
    mint: new PublicKey(PLAYER_MINTS.HarryBrook),
  },
  JosButtler: {
    displayName: "Jos Buttler",
    name: "Jos Buttler",
    team: "ENG",
    position: "WK",
    avatar: "JB",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=JosButtler",
    mint: new PublicKey(PLAYER_MINTS.JosButtler),
  },
  JoshInglis: {
    displayName: "Josh Inglis",
    name: "Josh Inglis",
    team: "AUS",
    position: "WK",
    avatar: "JI",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=JoshInglis",
    mint: new PublicKey(PLAYER_MINTS.JoshInglis),
  },
  KharyPierre: {
    displayName: "Khary Pierre",
    name: "Khary Pierre",
    team: "WI",
    position: "BWL",
    avatar: "KP",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=KharyPierre",
    mint: new PublicKey(PLAYER_MINTS.KharyPierre),
  },
  RishabhPant: {
    displayName: "Rishabh Pant",
    name: "Rishabh Pant",
    team: "IND",
    position: "WK",
    avatar: "RP",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=RishabhPant",
    mint: new PublicKey(PLAYER_MINTS.RishabhPant),
  },
  RohitSharma: {
    displayName: "Rohit Sharma",
    name: "Rohit Sharma",
    team: "IND",
    position: "BAT",
    avatar: "RS",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=RohitSharma",
    mint: new PublicKey(PLAYER_MINTS.RohitSharma),
  },
  JohnCampbell: {
    displayName: "John Campbell",
    name: "John Campbell",
    team: "WI",
    position: "BAT",
    avatar: "JC",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=JohnCampbell",
    mint: new PublicKey(PLAYER_MINTS.JohnCampbell),
  },
  MohammedSiraj: {
    displayName: "Mohammed Siraj",
    name: "Mohammed Siraj",
    team: "IND",
    position: "BWL",
    avatar: "MS",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=MohammedSiraj",
    mint: new PublicKey(PLAYER_MINTS.MohammedSiraj),
  },
  AlickAthanaze: {
    displayName: "Alick Athanaze",
    name: "Alick Athanaze",
    team: "WI",
    position: "BAT",
    avatar: "AA",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=AlickAthanaze",
    mint: new PublicKey(PLAYER_MINTS.AlickAthanaze),
  },
  YashasviJaiswal: {
    displayName: "Yashasvi Jaiswal",
    name: "Yashasvi Jaiswal",
    team: "IND",
    position: "BAT",
    avatar: "YJ",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=YashasviJaiswal",
    mint: new PublicKey(PLAYER_MINTS.YashasviJaiswal),
  },
  WashingtonSundar: {
    displayName: "Washington Sundar",
    name: "Washington Sundar",
    team: "IND",
    position: "AR",
    avatar: "WS",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=WashingtonSundar",
    mint: new PublicKey(PLAYER_MINTS.WashingtonSundar),
  },
};

// ===== HELPER FUNCTIONS =====

/**
 * Get player info by token name
 */
export function getPlayerInfo(tokenName: string): PlayerInfo | undefined {
  return PLAYER_MAPPING[tokenName];
}

/**
 * Get pool address for a player token
 */
export function getPoolAddress(playerName: string): PublicKey | undefined {
  const poolAddr = POOL_ADDRESSES[playerName as keyof typeof POOL_ADDRESSES];
  return poolAddr ? new PublicKey(poolAddr) : undefined;
}

/**
 * Get all player token names
 */
export function getAllPlayerTokenNames(): string[] {
  return Object.keys(PLAYER_MAPPING);
}

/**
 * Get all player infos
 */
export function getAllPlayerInfos(): PlayerInfo[] {
  return Object.values(PLAYER_MAPPING);
}

