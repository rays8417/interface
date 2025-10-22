import { useState } from 'react';
import { getApiUrl } from '@/lib/constants';

interface PackPlayer {
  amount: number;
  player: string;
  txHash?: string;
  success?: boolean;
  price?: number;
}

interface PackOpeningResult {
  success: boolean;
  data?: {
    packId: string;
    packType: string;
    players: PackPlayer[];
    totalValue: number;
    message: string;
  };
  error?: string;
}

export function usePackOpening() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open pack using backend API
  const openPack = async (packId: string): Promise<PackOpeningResult> => {
    setLoading(true);
    setError(null);

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

      return {
        success: true,
        data: result.data,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to open pack';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const getUserPacks = async (address: string, opened?: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (opened !== undefined) {
        params.append('opened', opened.toString());
      }

      const response = await fetch(
        `${getApiUrl()}/api/packs/user/${address}?${params.toString()}`,
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

      return {
        success: true,
        data: result.data,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch packs';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const getPackDetails = async (packId: string) => {
    setLoading(true);
    setError(null);

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
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const getLatestUnopenedPack = async (address: string, packType: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/packs/latest/${address}?packType=${packType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch latest unopened pack');
      }

      if (!result.success) {
        throw new Error(result.error || 'No unopened pack found');
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch latest unopened pack';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    openPack,
    getUserPacks,
    getPackDetails,
    getLatestUnopenedPack,
  };
}
