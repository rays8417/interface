import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import debounce from "lodash/debounce";
import { getSolanaConnection, SWAP_PROGRAM_ID, DECIMAL_MULTIPLIER, BOSON_MINT } from "@/lib/constants";

const connection = getSolanaConnection();

export function useSwapQuote(
  fromTokenMint: PublicKey | undefined,
  toTokenMint: PublicKey | undefined,
  tokenPrices: any
) {
  const [receiveAmount, setReceiveAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchQuote = async (inputAmount: string, fromMint: PublicKey, toMint: PublicKey) => {
    if (!inputAmount || Number(inputAmount) <= 0) {
      setReceiveAmount("");
      return;
    }

    setLoading(true);

    try {
      const amountIn = Math.floor(Number(inputAmount) * DECIMAL_MULTIPLIER);

      // Find the pool for this token pair
      const accounts = await connection.getProgramAccounts(SWAP_PROGRAM_ID, {
        filters: [
          {
            dataSize: 8 + 32 + 32 + 32, // discriminator + amm + mint_a + mint_b
          },
        ],
      });

      let poolPubkey: PublicKey | null = null;
      let poolData: Buffer | null = null;

      // Find matching pool
      for (const { pubkey, account } of accounts) {
        const data = account.data;
        const poolMintABytes = data.slice(40, 72);
        const poolMintBBytes = data.slice(72, 104);
        const poolMintA = new PublicKey(poolMintABytes);
        const poolMintB = new PublicKey(poolMintBBytes);

        if (
          (poolMintA.equals(fromMint) && poolMintB.equals(toMint)) ||
          (poolMintA.equals(toMint) && poolMintB.equals(fromMint))
        ) {
          poolPubkey = pubkey;
          poolData = data;
          break;
        }
      }

      if (!poolPubkey || !poolData) {
        throw new Error("Pool not found for this token pair");
      }

      // Extract pool data
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

      // Get pool token accounts
      const poolAccountA = await getAssociatedTokenAddress(poolMintA, poolAuthority, true);
      const poolAccountB = await getAssociatedTokenAddress(poolMintB, poolAuthority, true);

      // Fetch reserves
      const [accountAInfo, accountBInfo] = await Promise.all([
        getAccount(connection, poolAccountA),
        getAccount(connection, poolAccountB),
      ]);

      const reserveA = Number(accountAInfo.amount);
      const reserveB = Number(accountBInfo.amount);

      // Determine which reserve corresponds to input and output
      const swappingAtoB = poolMintA.equals(fromMint);
      const reserveIn = swappingAtoB ? reserveA : reserveB;
      const reserveOut = swappingAtoB ? reserveB : reserveA;

      // Calculate output using constant product formula: x * y = k
      // amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
      // This is simplified; actual implementation might have fees
      const amountOut = Math.floor((amountIn * reserveOut) / (reserveIn + amountIn));

      setReceiveAmount((amountOut / DECIMAL_MULTIPLIER).toString());
    } catch (error) {
      console.error("❌ Failed to fetch quote:", error);

      // Fallback to price calculation if available
      if (tokenPrices?.current?.reserves) {
        try {
          let fallbackOutput = 0;
          const isFromBoson = fromTokenMint?.equals(BOSON_MINT);

          if (!isFromBoson) {
            // Converting Player -> BOSON: multiply by BOSON per Player
            fallbackOutput = Number(inputAmount) * tokenPrices.current.reserves.playerPriceInBoson;
          } else {
            // Converting BOSON -> Player: multiply by Player per BOSON
            fallbackOutput = Number(inputAmount) * tokenPrices.current.reserves.bosonPriceInPlayer;
          }

          setReceiveAmount(fallbackOutput.toString());
        } catch (fallbackError) {
          console.error("❌ Fallback calculation also failed:", fallbackError);
          setReceiveAmount("0");
        }
      } else {
        setReceiveAmount("0");
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchQuote = useCallback(
    debounce(
      (inputAmount: string, fromMint: PublicKey, toMint: PublicKey) =>
        fetchQuote(inputAmount, fromMint, toMint),
      500
    ),
    [tokenPrices]
  );

  return {
    receiveAmount,
    loading,
    fetchQuote: (inputAmount: string) => {
      if (fromTokenMint && toTokenMint) {
        debouncedFetchQuote(inputAmount, fromTokenMint, toTokenMint);
      }
    },
    setReceiveAmount,
  };
}
