import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiUrl } from '@/lib/constants';

interface PackPlayer {
  amount: number;
  player: string;
  txHash?: string;
  success?: boolean;
  price?: number;
}

interface UserPack {
  id: string;
  userId: string;
  packType: string;
  isOpened: boolean;
  players: PackPlayer[];
  totalValue: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPacksResult {
  success: boolean;
  data?: UserPack[];
  error?: string;
}

export function useUserPacks(walletAddress?: string) {
  const [userPacks, setUserPacks] = useState<UserPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUserPacks = useCallback(async () => {
    if (!walletAddress) {
      setLoading(false);
      setUserPacks([]);
      setHasLoaded(false);
      return;
    }

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${getApiUrl()}/api/packs/user/${walletAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch packs');
      }

      if (result.success) {
        setUserPacks(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch packs');
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }
      const errorMessage = err.message || 'Failed to fetch packs';
      setError(errorMessage);
      console.error('Error fetching user packs:', err);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchUserPacks();
    
    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [walletAddress, refreshTrigger, fetchUserPacks]);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const getPackDetails = useCallback(async (packId: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/packs/${packId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch pack details');
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch pack details';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  const openPack = useCallback(async (packId: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/packs/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to open pack');
      }

      if (!result.success) {
        throw new Error(result.error || 'Pack opening failed');
      }

      // Optimistically update the local state instead of fetching again
      setUserPacks(prevPacks => 
        prevPacks.map(pack => 
          pack.id === packId 
            ? { ...pack, isOpened: true, players: result.data.players } 
            : pack
        )
      );

      return {
        success: true,
        data: result.data,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to open pack';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  return {
    userPacks,
    loading,
    error,
    hasLoaded,
    getPackDetails,
    openPack,
    refresh,
  };
}
