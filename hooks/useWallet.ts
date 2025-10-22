import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";  // or maybe just '@privy-io/react-auth' depending on version
import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/lib/constants";

export function useWallet() {
  const { ready: authReady, authenticated, user, login } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();

  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const trackedAddressRef = useRef<string | null>(null);
  const wasEverNewUserRef = useRef<boolean>(false);

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
    console.log("[WALLET] useEffect triggered - account:", account?.address, "tracked:", trackedAddressRef.current);
    
    const trackUserConnection = async (address: string) => {
      console.log("[WALLET] 🚀 First wallet connect - tracking user:", address);
      
      try {
        const apiUrl = getApiUrl();
        console.log("[WALLET] API URL:", apiUrl);
        
        const response = await fetch(`${apiUrl}/api/users/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        });

        console.log("[WALLET] Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to track user: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[WALLET] Track response:", data);
        console.log("[WALLET] isNewUser value:", data.user?.isNewUser, "type:", typeof data.user?.isNewUser);
        
        // Remember if user was ever detected as new
        if (data.user?.isNewUser === true) {
          wasEverNewUserRef.current = true;
          console.log("[WALLET] 🎉 NEW USER DETECTED! Marking as new user and showing modal!");
          setShowWelcomeModal(true);
          console.log("[WALLET] Modal state set to true");
        } else if (wasEverNewUserRef.current) {
          console.log("[WALLET] User was previously detected as new, still showing modal");
          setShowWelcomeModal(true);
        } else {
          console.log("[WALLET] Not a new user, not showing modal");
        }
      } catch (error) {
        console.error("[WALLET] Failed to track user:", error);
      }
    };

    // Track only on first wallet connect
    if (account?.address && !trackedAddressRef.current) {
      console.log("[WALLET] First time seeing this address, tracking...");
      trackedAddressRef.current = account.address;
      trackUserConnection(account.address);
    } else if (!account?.address) {
      console.log("[WALLET] No account, resetting tracked address and new user status");
      // Reset when wallet disconnects
      trackedAddressRef.current = null;
      wasEverNewUserRef.current = false;
    } else {
      console.log("[WALLET] Address already tracked, skipping");
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

  // Function to manually show welcome modal (for testing)
  const showWelcome = () => {
    console.log("[WALLET] Manually showing welcome modal");
    setShowWelcomeModal(true);
  };

  // Function to reset welcome modal (for testing)
  const resetWelcomeModal = () => {
    console.log("[WALLET] Resetting welcome modal state and new user status");
    setShowWelcomeModal(false);
    wasEverNewUserRef.current = false;
  };

  // Function to manually mark user as new (for testing)
  const markAsNewUser = () => {
    console.log("[WALLET] Manually marking user as new");
    wasEverNewUserRef.current = true;
    setShowWelcomeModal(true);
  };

  // Make functions available globally for testing
  useEffect(() => {
    (window as any).showWelcome = showWelcome;
    (window as any).resetWelcomeModal = resetWelcomeModal;
    (window as any).markAsNewUser = markAsNewUser;
    (window as any).getWalletState = () => ({
      account: account?.address,
      showWelcomeModal,
      trackedAddress: trackedAddressRef.current,
      wasEverNewUser: wasEverNewUserRef.current
    });
    console.log("[WALLET] Test functions available:");
    console.log("  - window.showWelcome() - Show modal");
    console.log("  - window.resetWelcomeModal() - Reset modal");
    console.log("  - window.markAsNewUser() - Mark as new user");
    console.log("  - window.getWalletState() - Get current state");
  }, [account, showWelcomeModal]);

  return {
    account,
    isConnecting,
    connectWallet,
    disconnectWallet,
    showWelcomeModal,
    setShowWelcomeModal,
    resetWelcomeModal,
  };
}
