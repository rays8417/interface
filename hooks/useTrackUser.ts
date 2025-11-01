import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getApiUrl } from "@/lib/constants";

/**
 * Hook to track user when their wallet address changes
 * Sends a track request with address and Twitter username
 * Returns isNewUser status from the track response
 */
export function useTrackUser(address: string | undefined) {
  const { user } = usePrivy();
  const trackedAddressRef = useRef<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

  // Track user when address changes (only once per address)
  useEffect(() => {
    // Skip if no address or already tracked this address
    if (!address || trackedAddressRef.current === address) {
      return;
    }

    // Mark as tracked BEFORE async call
    trackedAddressRef.current = address;
    // Reset isNewUser state
    setIsNewUser(null);

    const trackUser = async () => {
      console.log("[TRACK] Tracking user with address:", address);

      // Extract Twitter username from Privy user object
      const userAny = user as any;
      const twitterAccount = userAny?.linkedAccounts?.find((account: any) =>
        account.type === "twitter_oauth" ||
        account.type === "twitter" ||
        account.type === "x"
      );
      const twitterUsername = twitterAccount?.username || null;

      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/users/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, twitterUsername }),
        });

        if (!response.ok) {
          throw new Error(`Failed to track user: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[TRACK] Track response:", data);
        console.log("[TRACK] isNewUser:", data.user?.isNewUser);
        
        // Set isNewUser status
        setIsNewUser(data.user?.isNewUser === true);
      } catch (error) {
        console.error("[TRACK] Failed to track user:", error);
        // Reset on error so it can retry
        trackedAddressRef.current = null;
        setIsNewUser(null);
      }
    };

    trackUser();
  }, [address, user]);

  // Reset tracked address when address becomes null/undefined
  useEffect(() => {
    if (!address) {
      trackedAddressRef.current = null;
      setIsNewUser(null);
    }
  }, [address]);

  return { isNewUser };
}

