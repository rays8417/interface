import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import {
  getSolanaConnection,
  SWAP_PROGRAM_ID,
  PLAYER_MAPPING,
  BOSON_MINT,
  type PlayerPosition,
  DECIMAL_MULTIPLIER,
} from "@/lib/constants";

const connection = getSolanaConnection();

interface Holding {
  id: string;
  playerName: string;
  moduleName: string;
  team: string;
  position: PlayerPosition;
  price: number;
  shares: number;
  holdings: number;
  avatar: string;
  imageUrl: string;
}

export function usePlayerHoldings(walletAddress?: string) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    const fetchHoldings = async () => {
      try {
        setLoading(true);
        setError(null);

        const walletPubkey = new PublicKey(walletAddress);

        // Fetch all pool accounts to get prices
        const poolAccounts = await connection.getProgramAccounts(SWAP_PROGRAM_ID, {
          filters: [
            {
              dataSize: 8 + 32 + 32 + 32, // discriminator + amm + mint_a + mint_b
            },
          ],
        });

        // Build a map of player mint -> pool data for price calculation
        const poolDataMap = new Map<string, { poolPubkey: PublicKey; data: Buffer }>();
        
        for (const { pubkey, account } of poolAccounts) {
          const data = account.data;
          const poolMintABytes = data.slice(40, 72);
          const poolMintBBytes = data.slice(72, 104);
          const poolMintA = new PublicKey(poolMintABytes);
          const poolMintB = new PublicKey(poolMintBBytes);

          // Check if one is BOSON
          const isABoson = poolMintA.equals(BOSON_MINT);
          const isBBoson = poolMintB.equals(BOSON_MINT);

          if (isABoson || isBBoson) {
            const playerMint = isABoson ? poolMintB : poolMintA;
            poolDataMap.set(playerMint.toBase58(), { poolPubkey: pubkey, data });
          }
        }

        // Fetch balances and prices for all players
        const processedHoldings: Holding[] = [];

        for (const [playerName, playerInfo] of Object.entries(PLAYER_MAPPING)) {
          try {
            // Get player token balance
            const playerTokenAccount = await getAssociatedTokenAddress(
              playerInfo.mint,
              walletPubkey
            );

            let balance = 0;
            try {
              const accountInfo = await getAccount(connection, playerTokenAccount);
              balance = Number(accountInfo.amount) / DECIMAL_MULTIPLIER;
            } catch {
              // Account doesn't exist, balance is 0
              balance = 0;
            }

            if (balance === 0) continue; // Skip if user has no tokens

            // Get price from pool
            let price = 0;
            const poolInfo = poolDataMap.get(playerInfo.mint.toBase58());
            
            if (poolInfo) {
              try {
                const { poolPubkey, data } = poolInfo;
                const ammBytes = data.slice(8, 40);
                const amm = new PublicKey(ammBytes);
                const poolMintABytes = data.slice(40, 72);
                const poolMintBBytes = data.slice(72, 104);
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

                // Fetch balances
                const [accountAInfo, accountBInfo] = await Promise.all([
                  getAccount(connection, poolAccountA),
                  getAccount(connection, poolAccountB),
                ]);

                const balanceA = Number(accountAInfo.amount) / DECIMAL_MULTIPLIER;
                const balanceB = Number(accountBInfo.amount) / DECIMAL_MULTIPLIER;

                // Determine which is BOSON
                const firstIsBoson = poolMintA.equals(BOSON_MINT);
                const bosonReserve = firstIsBoson ? balanceA : balanceB;
                const playerReserve = firstIsBoson ? balanceB : balanceA;

                price = playerReserve > 0 ? bosonReserve / playerReserve : 0;
              } catch (priceError) {
                console.error(`Failed to fetch price for ${playerName}:`, priceError);
              }
            }

            processedHoldings.push({
              id: playerName,
              playerName: playerInfo.name,
              moduleName: playerName,
              team: playerInfo.team,
              position: playerInfo.position,
              price,
              shares: balance,
              holdings: balance * price,
              avatar: playerInfo.avatar,
              imageUrl: playerInfo.imageUrl || "",
            });
          } catch (error) {
            console.error(`Failed to process holdings for ${playerName}:`, error);
          }
        }

        setHoldings(processedHoldings);
      } catch (err) {
        setError("Failed to fetch player data");
        console.error("Error processing data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [walletAddress]);

  return { holdings, loading, error };
}
