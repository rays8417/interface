import { useState } from "react";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { getSolanaConnection, SWAP_PROGRAM_ID, DECIMAL_MULTIPLIER, SLIPPAGE_TOLERANCE } from "@/lib/constants";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";

const connection = getSolanaConnection();

export function useSwapTransaction() {
  const [loading, setLoading] = useState(false);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const executeSwap = async (
    account: any,
    payAmount: string,
    receiveAmount: string,
    fromTokenMint: PublicKey,
    toTokenMint: PublicKey,
    fromTokenName: string,
    fromBalance: number
  ) => {
    if (!authenticated || wallets.length === 0 || !payAmount || Number(payAmount) <= 0) {
      toast.error("Please connect wallet and enter a valid amount");
      return { success: false };
    }

    const wallet = wallets[0];
    const publicKey = new PublicKey(wallet.address);

    const x_in = Math.floor(Number(payAmount) * DECIMAL_MULTIPLIER);
    const expectedAmountOut = Math.floor(Number(receiveAmount) * DECIMAL_MULTIPLIER);
    const y_min_out = Math.floor(expectedAmountOut * SLIPPAGE_TOLERANCE);

    if (fromBalance < Number(payAmount)) {
      toast.error(
        `Insufficient ${fromTokenName} balance. You have ${fromBalance.toFixed(4)} but are trying to swap ${payAmount}`
      );
      return { success: false };
    }

    setLoading(true);

    try {
      // Find the pool for this token pair
      const poolAccounts = await connection.getProgramAccounts(SWAP_PROGRAM_ID, {
        filters: [
          {
            dataSize: 8 + 32 + 32 + 32,
          },
        ],
      });

      let poolPubkey: PublicKey | null = null;
      let poolData: Buffer | null = null;

      for (const { pubkey, account: poolAccount } of poolAccounts) {
        const data = poolAccount.data;
        const poolMintABytes = data.slice(40, 72);
        const poolMintBBytes = data.slice(72, 104);
        const poolMintA = new PublicKey(poolMintABytes);
        const poolMintB = new PublicKey(poolMintBBytes);

        if (
          (poolMintA.equals(fromTokenMint) && poolMintB.equals(toTokenMint)) ||
          (poolMintA.equals(toTokenMint) && poolMintB.equals(fromTokenMint))
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
      const mintA = new PublicKey(poolMintABytes);
      const mintB = new PublicKey(poolMintBBytes);

      // Determine swap direction
      const swapA = mintA.equals(fromTokenMint);

      // Derive pool authority
      const [poolAuthority] = await PublicKey.findProgramAddress(
        [amm.toBuffer(), mintA.toBuffer(), mintB.toBuffer(), Buffer.from("authority")],
        SWAP_PROGRAM_ID
      );

      // Get pool and trader token accounts
      const poolAccountA = await getAssociatedTokenAddress(mintA, poolAuthority, true);
      const poolAccountB = await getAssociatedTokenAddress(mintB, poolAuthority, true);
      const traderAccountA = await getAssociatedTokenAddress(mintA, publicKey);
      const traderAccountB = await getAssociatedTokenAddress(mintB, publicKey);

      // Check if accounts exist
      const [traderAccountAInfo, traderAccountBInfo] = await Promise.all([
        connection.getAccountInfo(traderAccountA),
        connection.getAccountInfo(traderAccountB),
      ]);

      // Build transaction
      const transaction = new Transaction();

      // Create output token account if it doesn't exist
      if (swapA && !traderAccountBInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            traderAccountB,
            publicKey,
            mintB
          )
        );
      } else if (!swapA && !traderAccountAInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            traderAccountA,
            publicKey,
            mintA
          )
        );
      }

      // Build swap instruction data
      const discriminator = Buffer.from([249, 86, 253, 50, 177, 221, 73, 162]);
      const swapABuffer = Buffer.from([swapA ? 1 : 0]);
      const inputAmountBN = new anchor.BN(x_in);
      const minOutputAmountBN = new anchor.BN(y_min_out);
      
      const data = Buffer.concat([
        discriminator,
        swapABuffer,
        inputAmountBN.toArrayLike(Buffer, "le", 8),
        minOutputAmountBN.toArrayLike(Buffer, "le", 8),
      ]);

      // Build swap instruction
      const swapInstruction = new TransactionInstruction({
        keys: [
          { pubkey: amm, isSigner: false, isWritable: false },
          { pubkey: poolPubkey, isSigner: false, isWritable: false },
          { pubkey: poolAuthority, isSigner: false, isWritable: false },
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: mintA, isSigner: false, isWritable: false },
          { pubkey: mintB, isSigner: false, isWritable: false },
          { pubkey: poolAccountA, isSigner: false, isWritable: true },
          { pubkey: poolAccountB, isSigner: false, isWritable: true },
          { pubkey: traderAccountA, isSigner: false, isWritable: true },
          { pubkey: traderAccountB, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: SWAP_PROGRAM_ID,
        data: data,
      });

      transaction.add(swapInstruction);
      transaction.feePayer = publicKey;

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Check SOL balance
      const balance = await connection.getBalance(publicKey);
      if (balance < 5000000) {
        toast.error(
          `Low SOL balance! You have ${(balance / 1e9).toFixed(4)} SOL. You need at least 0.005 SOL for transaction fees.`
        );
        return { success: false };
      }

      // Send transaction using Privy wallet
      let signature: string;
      try {
        // Serialize the full unsigned transaction for Privy
        const serializedTx = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });

        // Sign using Privy's wallet
        const { signedTransaction } = await wallet.signTransaction({
          transaction: serializedTx,
          chain: "solana:devnet",
        });

        // The signedTransaction from Privy is the full signed transaction
        const signedTxBytes = typeof signedTransaction === 'string' 
          ? Buffer.from(signedTransaction, "base64")
          : Buffer.from(signedTransaction);

        signature = await connection.sendRawTransaction(signedTxBytes, {
          skipPreflight: false,
          maxRetries: 3,
        });
      } catch (sendError: any) {
        console.error("❌ Send transaction error:", sendError);
        toast.error(`Transaction failed: ${sendError.message}`);
        return { success: false };
      }

      toast.success(`Swap submitted! Signature: ${signature.slice(0, 8)}...`);

      // Wait for confirmation
      try {
        await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed"
        );

        toast.success("Swap successful! 🎉");
        return { success: true };
      } catch (confirmError: any) {
        console.warn("Confirmation timeout, checking status...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const tx = await connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
        });
        if (tx && !tx.meta?.err) {
          toast.success("Swap successful! 🎉");
          return { success: true };
        } else {
          toast.error("Transaction may have failed. Check explorer.");
          return { success: false };
        }
      }
    } catch (error: any) {
      console.error("❌ === SWAP FAILED ===", error);
      let errorMessage = "Swap failed. ";

      if (error?.message?.includes("User rejected")) {
        errorMessage += "Transaction was rejected.";
      } else if (error?.message?.includes("insufficient funds")) {
        errorMessage += "Insufficient funds.";
      } else {
        errorMessage += `Error: ${error?.message || "Unknown error"}`;
      }

      toast.error(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { executeSwap, loading };
}
