import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { getSolanaConnection, BOSON_TOKEN, DECIMAL_MULTIPLIER, PLAYER_MAPPING } from "@/lib/constants";

const connection = getSolanaConnection();

export function useTokenBalances(walletAddress?: string, availableTokens: any[] = []) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress || availableTokens.length === 0) {
      setLoading(false);
      return;
    }

    const fetchBalances = async () => {
      setLoading(true);
      try {
        const newBalances: Record<string, number> = {};
        const walletPubkey = new PublicKey(walletAddress);

        // Fetch BOSON balance
        try {
          const bosonTokenAccount = await getAssociatedTokenAddress(
            BOSON_TOKEN.mint,
            walletPubkey
          );
          
          const accountInfo = await getAccount(connection, bosonTokenAccount);
          newBalances.boson = Number(accountInfo.amount) / DECIMAL_MULTIPLIER;
        } catch (error) {
          // Account doesn't exist or other error
          newBalances.boson = 0;
        }

        // Fetch balances for all available player tokens
        for (const token of availableTokens) {
          try {
            const tokenAccount = await getAssociatedTokenAddress(
              token.mint,
              walletPubkey
            );
            
            const accountInfo = await getAccount(connection, tokenAccount);
            newBalances[token.name.toLowerCase()] = Number(accountInfo.amount) / DECIMAL_MULTIPLIER;
          } catch (error) {
            // Account doesn't exist or other error
            newBalances[token.name.toLowerCase()] = 0;
          }
        }

        setBalances(newBalances);
      } catch (error) {
        console.error("Failed to fetch balances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [walletAddress, availableTokens]);

  return { balances, loading, refetch: () => {} };
}
