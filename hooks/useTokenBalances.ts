import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { getSolanaConnection, BOSON_TOKEN, DECIMAL_MULTIPLIER, PLAYER_MAPPING } from "@/lib/constants";
import { useBalanceRefreshSubscription } from "./useBalanceRefresh";

const connection = getSolanaConnection();

export function useTokenBalances(walletAddress?: string, availableTokens: any[] = []) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    if (!walletAddress || availableTokens.length === 0) {
      setLoading(false);
      return {};
    }

    setLoading(true);
    try {
      const newBalances: Record<string, number> = {};
      const walletPubkey = new PublicKey(walletAddress);

      // Prepare all token account addresses in parallel
      const tokenAccountPromises = [
        // BOSON token account
        getAssociatedTokenAddress(BOSON_TOKEN.mint, walletPubkey).then(addr => ({
          name: 'boson',
          address: addr,
          mint: BOSON_TOKEN.mint
        })),
        // All player token accounts
        ...availableTokens.map(token => 
          getAssociatedTokenAddress(token.mint, walletPubkey).then(addr => ({
            name: token.name.toLowerCase(),
            address: addr,
            mint: token.mint
          }))
        )
      ];

      // Get all token account addresses in parallel
      const tokenAccounts = await Promise.all(tokenAccountPromises);
      
      // Fetch all account data in ONE batch RPC call (much faster!)
      const accountInfos = await connection.getMultipleAccountsInfo(
        tokenAccounts.map(ta => ta.address)
      );

      // Process results
      for (let i = 0; i < accountInfos.length; i++) {
        const tokenName = tokenAccounts[i].name;
        const accountInfo = accountInfos[i];
        
        if (accountInfo && accountInfo.data.length > 0) {
          try {
            // SPL Token Account layout: 
            // - mint: 32 bytes (offset 0)
            // - owner: 32 bytes (offset 32)  
            // - amount: 8 bytes (offset 64)
            const amount = accountInfo.data.readBigUInt64LE(64);
            newBalances[tokenName] = Number(amount) / DECIMAL_MULTIPLIER;
          } catch (error) {
            console.error(`Failed to parse balance for ${tokenName}:`, error);
            newBalances[tokenName] = 0;
          }
        } else {
          // Token account doesn't exist = 0 balance
          newBalances[tokenName] = 0;
        }
      }

      setBalances(newBalances);
      return newBalances;
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      return {};
    } finally {
      setLoading(false);
    }
  }, [walletAddress, availableTokens]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Subscribe to balance refresh events
  useBalanceRefreshSubscription(fetchBalances);

  return { balances, loading, refetch: fetchBalances };
}
