import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/lib/constants";
import { useUserData } from "@/contexts/UserDataContext";

export function useWallet() {
  const { ready: authReady, authenticated, user, login } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const { fetchUserData } = useUserData();

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
    const trackUserConnection = async (address: string) => {
      try {
        const apiUrl = getApiUrl();

        // Get referral code and Twitter username
        const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;

        const userAny = user as any;
        
        const twitterAccount = userAny?.linkedAccounts?.find((account: any) => 
          account.type === 'twitter_oauth' || 
          account.type === 'twitter' ||
          account.type === 'x'
        );
        
        const twitterUsername = twitterAccount?.username || null;

        const payload: any = { address };
        if (twitterUsername) {
          payload.twitterUsername = twitterUsername;
        }
        if (referralCode) {
          payload.inviteCode = referralCode;
        }

        const response = await fetch(`${apiUrl}/api/users/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to track user: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Clear referral code after successful tracking
        if (referralCode && typeof window !== 'undefined') {
          localStorage.removeItem('referralCode');
        }
        
        // Fetch complete user data (XP, VP, invites, etc.)
        await fetchUserData(address);
        
        // Remember if user was ever detected as new
        if (data.user?.isNewUser === true) {
          wasEverNewUserRef.current = true;
          setShowWelcomeModal(true);
        } else if (wasEverNewUserRef.current) {
          setShowWelcomeModal(true);
        }
      } catch (error) {
      
      }
    };

    // Track only on first wallet connect
    if (account?.address && !trackedAddressRef.current) {
      trackedAddressRef.current = account.address;
      trackUserConnection(account.address);
    } else if (!account?.address) {
      // Reset when wallet disconnects
      trackedAddressRef.current = null;
      wasEverNewUserRef.current = false;
    }
  }, [account, user]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      login();
      // After login, we rely on the above effects to create/use wallet
    } catch (error) {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (authReady && walletsReady && (wallets.length > 0 || !authenticated)) {
      setIsConnecting(false);
    }
  }, [authReady, walletsReady, wallets.length, authenticated]);

  const disconnectWallet = async () => {
    // Disconnect is managed through Privy's UI or logout flow
  };

  // Function to manually show welcome modal (for testing)
  const showWelcome = () => {
    setShowWelcomeModal(true);
  };

  // Function to reset welcome modal (for testing)
  const resetWelcomeModal = () => {
    setShowWelcomeModal(false);
    wasEverNewUserRef.current = false;
  };

  // Function to manually mark user as new (for testing)
  const markAsNewUser = () => {
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
