import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";  // or maybe just '@privy-io/react-auth' depending on version
import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/lib/constants";

export function useWallet() {
  const { ready: authReady, authenticated, user, login } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();

  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const trackedAddressRef = useRef<string | null>(null);

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

  // Effect: track user when wallet connects
  useEffect(() => {
    const trackUserConnection = async (address: string) => {
      // Avoid duplicate tracking
      if (trackedAddressRef.current === address) return;
      
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/users/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        });

        if (!response.ok) {
          throw new Error(`Failed to track user: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[WALLET] User tracked successfully:", data);
        
        // Mark this address as tracked
        trackedAddressRef.current = address;

        // Show welcome message for new users
        if (data.user?.isNewUser) {
          console.log("[WALLET] Welcome new user! Starter tokens are being sent.");
        }
      } catch (error) {
        console.error("[WALLET] Failed to track user connection:", error);
      }
    };

    // Track when a wallet connects (account goes from null to having an address)
    if (account?.address) {
      trackUserConnection(account.address);
    } else {
      // Reset tracking ref when wallet disconnects
      trackedAddressRef.current = null;
    }
  }, [account]);

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
