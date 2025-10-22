import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPacks = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

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
        const errorMessage = err.message || 'Failed to fetch packs';
        setError(errorMessage);
        console.error('Error fetching user packs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPacks();
  }, [walletAddress]);

  const getPackDetails = async (packId: string) => {
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
  };

  const openPack = async (packId: string) => {
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

      // Refresh packs after opening
      if (walletAddress) {
        const refreshResponse = await fetch(
          `${getApiUrl()}/api/packs/user/${walletAddress}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setUserPacks(refreshResult.data || []);
        }
      }

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
  };

  return {
    userPacks,
    loading,
    error,
    getPackDetails,
    openPack,
  };
}
