import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { getSolanaConnection, SWAP_PROGRAM_ID, PLAYER_MAPPING, BOSON_MINT } from "@/lib/constants";

interface TokenPair {
  token1: {
    name: string;
    mint: PublicKey;
    displayName: string;
    team?: string;
    position?: string;
  };
  token2: {
    name: string;
    mint: PublicKey;
    displayName: string;
  };
  reserves: {
    reserve_x: string;
    reserve_y: string;
    poolAddress: string;
  };
}

const connection = getSolanaConnection();

export function useLiquidityPairs() {
  const [availableTokenPairs, setAvailableTokenPairs] = useState<TokenPair[]>([]);
  const [availableTokens, setAvailableTokens] = useState<Array<{
    name: string;
    mint: PublicKey;
    displayName: string;
    team?: string;
    position?: string;
    avatar: string;
    imageUrl: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPairs = async () => {
      setLoading(true);
      try {
        // Fetch all pool accounts from the swap program
        // Pool account structure: discriminator (8 bytes) + amm (32) + mint_a (32) + mint_b (32) + ...
        const accounts = await connection.getProgramAccounts(SWAP_PROGRAM_ID, {
          filters: [
            {
              // Filter for pool accounts (they have a specific size)
              dataSize: 8 + 32 + 32 + 32, // Minimum size: discriminator + amm + mint_a + mint_b
            },
          ],
        });

        const parsedPairs: TokenPair[] = [];
        const tokenSet = new Set<string>();

        for (const { pubkey, account } of accounts) {
          try {
            const data = account.data;
            
            // Skip discriminator (first 8 bytes)
            // Parse: amm (32 bytes), mint_a (32 bytes), mint_b (32 bytes)
            const ammBytes = data.slice(8, 40);
            const mintABytes = data.slice(40, 72);
            const mintBBytes = data.slice(72, 104);

            const mintA = new PublicKey(mintABytes);
            const mintB = new PublicKey(mintBBytes);

            // Check if one of the mints is BOSON
            const isABoson = mintA.equals(BOSON_MINT);
            const isBBoson = mintB.equals(BOSON_MINT);

            if (!isABoson && !isBBoson) continue; // Skip pairs that don't involve BOSON

            const playerMint = isABoson ? mintB : mintA;
            const bosonMint = isABoson ? mintA : mintB;

            // Find player info by matching mint address
            const playerEntry = Object.entries(PLAYER_MAPPING).find(
              ([_, info]) => info.mint.equals(playerMint)
            );

            if (!playerEntry) continue; // Skip if player not in mapping

            const [playerName, playerInfo] = playerEntry;
            tokenSet.add(playerName);

            // Note: We can't easily get reserve balances without fetching the pool's token accounts
            // This would require additional calls. For now, we'll set placeholder values
            // In a full implementation, you'd fetch the pool's associated token accounts here

            const pair: TokenPair = {
              token1: {
                name: playerName,
                mint: playerMint,
                displayName: playerInfo.displayName,
                team: playerInfo.team,
                position: playerInfo.position,
              },
              token2: {
                name: "BOSON",
                mint: bosonMint,
                displayName: "BOSON",
              },
              reserves: {
                reserve_x: "0", // Placeholder - would need to fetch pool token accounts
                reserve_y: "0", // Placeholder - would need to fetch pool token accounts
                poolAddress: pubkey.toBase58(),
              },
            };

            parsedPairs.push(pair);
          } catch (error) {
            console.error(`Failed to parse pool account ${pubkey.toBase58()}:`, error);
          }
        }

        const tokensList = Array.from(tokenSet).map(tokenName => {
          const playerInfo = PLAYER_MAPPING[tokenName];
          return {
            name: tokenName,
            mint: playerInfo.mint,
            displayName: playerInfo.displayName,
            team: playerInfo.team,
            position: playerInfo.position,
            avatar: playerInfo.avatar,
            imageUrl: playerInfo.imageUrl,
          };
        });

        setAvailableTokenPairs(parsedPairs);
        setAvailableTokens(tokensList);
      } catch (error) {
        console.error("Failed to fetch liquidity pairs:", error);
        setAvailableTokenPairs([]);
        setAvailableTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPairs();
  }, []);

  return { availableTokenPairs, availableTokens, loading };
}
