import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { getSolanaConnection, SWAP_PROGRAM_ID, DECIMAL_MULTIPLIER, BOSON_MINT } from "@/lib/constants";

const connection = getSolanaConnection();

export function useTokenPairPrice(token1Mint?: PublicKey, token2Mint?: PublicKey) {
  const [tokenPrices, setTokenPrices] = useState({
    current: null as any,
    lastUpdated: null as Date | null,
  });
  const [loading, setLoading] = useState(true);

  const fetchPrice = async (mintA: PublicKey, mintB: PublicKey) => {
    setLoading(true);

    try {
      // Fetch all pool accounts and find the one matching our token pair
      const accounts = await connection.getProgramAccounts(SWAP_PROGRAM_ID, {
        filters: [
          {
            dataSize: 8 + 32 + 32 + 32, // discriminator + amm + mint_a + mint_b
          },
        ],
      });

      let poolPubkey: PublicKey | null = null;
      let poolData: Buffer | null = null;

      // Find the pool that matches our token pair
      for (const { pubkey, account } of accounts) {
        const data = account.data;
        const poolMintABytes = data.slice(40, 72);
        const poolMintBBytes = data.slice(72, 104);
        const poolMintA = new PublicKey(poolMintABytes);
        const poolMintB = new PublicKey(poolMintBBytes);

        // Check if this pool matches our pair (in either order)
        if (
          (poolMintA.equals(mintA) && poolMintB.equals(mintB)) ||
          (poolMintA.equals(mintB) && poolMintB.equals(mintA))
        ) {
          poolPubkey = pubkey;
          poolData = data;
          break;
        }
      }

      if (!poolPubkey || !poolData) {
        throw new Error("Pool not found for this token pair");
      }

      // Extract AMM and mint addresses from pool data
      const ammBytes = poolData.slice(8, 40);
      const amm = new PublicKey(ammBytes);
      const poolMintABytes = poolData.slice(40, 72);
      const poolMintBBytes = poolData.slice(72, 104);
      const poolMintA = new PublicKey(poolMintABytes);
      const poolMintB = new PublicKey(poolMintBBytes);

      // Derive pool authority
      const [poolAuthority] = await PublicKey.findProgramAddress(
        [amm.toBuffer(), poolMintA.toBuffer(), poolMintB.toBuffer(), Buffer.from("authority")],
        SWAP_PROGRAM_ID
      );

      // Get the pool's token accounts
      const poolAccountA = await getAssociatedTokenAddress(poolMintA, poolAuthority, true);
      const poolAccountB = await getAssociatedTokenAddress(poolMintB, poolAuthority, true);

      // Fetch balances
      const [accountAInfo, accountBInfo] = await Promise.all([
        getAccount(connection, poolAccountA),
        getAccount(connection, poolAccountB),
      ]);

      const balanceA = Number(accountAInfo.amount);
      const balanceB = Number(accountBInfo.amount);

      // Determine which is BOSON and which is the player token
      const firstIsBoson = poolMintA.equals(BOSON_MINT);
      const bosonRaw = firstIsBoson ? balanceA : balanceB;
      const playerRaw = firstIsBoson ? balanceB : balanceA;

      const boson = bosonRaw / DECIMAL_MULTIPLIER;
      const player = playerRaw / DECIMAL_MULTIPLIER;

      const priceInfo = {
        token1: firstIsBoson ? "BOSON" : "PLAYER",
        token2: firstIsBoson ? "PLAYER" : "BOSON",
        poolAddress: poolPubkey.toBase58(),
        reserves: {
          // Raw and formatted reserves (normalized)
          bosonRaw,
          playerRaw,
          bosonFormatted: boson,
          playerFormatted: player,
          // Exchange rates (normalized)
          playerPriceInBoson: player > 0 ? boson / player : 0, // BOSON per 1 PLAYER
          bosonPriceInPlayer: boson > 0 ? player / boson : 0, // PLAYER per 1 BOSON
          // USD pricing assuming BOSON = $1
          bosonPriceUSD: 1,
          playerPriceUSD: player > 0 ? boson / player : 0,
        },
      } as any;

      setTokenPrices({ current: priceInfo, lastUpdated: new Date() });
      return priceInfo;
    } catch (error) {
      console.error("❌ Failed to fetch token pair price:", error);
      setTokenPrices({ current: null, lastUpdated: new Date() });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token1Mint && token2Mint) {
      fetchPrice(token1Mint, token2Mint);

      // Set up periodic price updates every 30 seconds
      const priceInterval = setInterval(() => {
        fetchPrice(token1Mint, token2Mint);
      }, 30000);

      return () => clearInterval(priceInterval);
    } else {
      setLoading(false);
    }
  }, [token1Mint?.toBase58(), token2Mint?.toBase58()]);

  return { tokenPrices, loading, refetchPrice: fetchPrice };
}
