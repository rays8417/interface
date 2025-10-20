import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";  // or maybe just '@privy-io/react-auth' depending on version
import { useState, useEffect } from "react";

export function useWallet() {
  const { ready: authReady, authenticated, user, login } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();

  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Effect: update account whenever wallets change
  useEffect(() => {
    if (!walletsReady) return;

    if (wallets.length > 0) {
      const first = wallets[0];
      setAccount({ address: first.address });
    } else {
      setAccount(null);
    }
  }, [walletsReady, wallets]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
       login();
      // After login, we rely on the above effects to create/use wallet
    } catch (error) {
      console.error("Failed to connect wallet (login):", error);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (authReady && walletsReady && (wallets.length > 0 || !authenticated)) {
      setIsConnecting(false);
    }
  }, [authReady, walletsReady, wallets.length, authenticated]);

  const disconnectWallet = async () => {
    console.warn("Disconnect is managed through Privy's UI or logout flow");
  };

  return {
    account,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
}
