import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";  // or maybe just '@privy-io/react-auth' depending on version
import { useState, useEffect, useRef } from "react";

export function useWallet() {
  const { ready: authReady, authenticated, user, login } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();

  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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
