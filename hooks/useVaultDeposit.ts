import { useState } from "react";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { getSolanaConnection, DECIMAL_MULTIPLIER, BOSON_MINT, VAULT_PROGRAM_ID, VAULT_PDA } from "@/lib/constants";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useBalanceRefresh } from "./useBalanceRefresh";

const connection = getSolanaConnection();

// Use BOSON_MINT as the token mint (same as MOSON_MINT you mentioned)
const TOKEN_MINT = BOSON_MINT;

export function useVaultDeposit() {
  const [loading, setLoading] = useState(false);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { triggerRefresh } = useBalanceRefresh();

  const executeDeposit = async (
    account: any,
    amount: number,
    userBalance: number
  ) => {
    if (!authenticated || wallets.length === 0 || !amount || amount <= 0) {
      toast.error("Please connect wallet and enter a valid amount");
      return { success: false };
    }

    const wallet = wallets[0];
    const publicKey = new PublicKey(wallet.address);

    // Convert amount to smallest units
    const depositAmount = Math.floor(amount * DECIMAL_MULTIPLIER);

    if (userBalance < amount) {
      toast.error(
        `Insufficient BOSON balance. You have ${userBalance.toFixed(4)} but are trying to deposit ${amount}`
      );
      return { success: false };
    }

    setLoading(true);

    try {
      // Get user's token accounts
      const depositorTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      
      // Derive vault token account (vault owns the token account)
      const vaultTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, VAULT_PDA, true);

      // Check if accounts exist
      const [depositorAccountInfo, vaultAccountInfo] = await Promise.all([
        connection.getAccountInfo(depositorTokenAccount),
        connection.getAccountInfo(vaultTokenAccount),
      ]);

      // Build transaction
      const transaction = new Transaction();

      // Create user's token account if it doesn't exist
      if (!depositorAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            depositorTokenAccount,
            publicKey,
            TOKEN_MINT
          )
        );
      }

      // Create vault token account if it doesn't exist
      if (!vaultAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            vaultTokenAccount,
            VAULT_PDA, // owner is the vault PDA
            TOKEN_MINT
          )
        );
      }

      // Build deposit instruction data
      // Method discriminator for deposit function (computed from sha256 of "global:deposit")
      const discriminator = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]);
      const amountBN = new anchor.BN(depositAmount);
      
      const data = Buffer.concat([
        discriminator,
        amountBN.toArrayLike(Buffer, "le", 8),
      ]);

      // Build deposit instruction
      const depositInstruction = new TransactionInstruction({
        keys: [
          { pubkey: VAULT_PDA, isSigner: false, isWritable: false },
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: depositorTokenAccount, isSigner: false, isWritable: true },
          { pubkey: vaultTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: VAULT_PROGRAM_ID,
        data: data,
      });

      transaction.add(depositInstruction);
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
        // Keep full error details in the debug log for developers
        console.debug("❌ Send transaction error:", sendError);
        // Show a generic message to the user
        toast.error("There was an error");
        return { success: false };
      }

      toast.success(`Deposit submitted! Signature: ${signature.slice(0, 8)}...`);

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

        toast.success(`Purchase successfull! Deposited ${amount} BOSON 🎉`);
        triggerRefresh(); // Refresh token balances after successful deposit
        return { success: true };
      } catch (confirmError: any) {
        console.warn("Confirmation timeout, checking status...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const tx = await connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
        });
        if (tx && !tx.meta?.err) {
          toast.success(`Purchase successful! Deposited ${amount} BOSON 🎉`);
          triggerRefresh(); // Refresh token balances after successful deposit
          return { success: true };
        } else {
          toast.error("Transaction may have failed. Check explorer.");
          return { success: false };
        }
      }
    } catch (error: any) {
      // Preserve detailed error info for debugging
      console.debug("❌ === DEPOSIT FAILED ===", error);

      // Show only a generic error to users
      toast.error("There was an error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { executeDeposit, loading };
}