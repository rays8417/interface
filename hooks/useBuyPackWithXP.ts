import { useState } from "react";
import axios from "axios";
import { getApiUrl } from "@/lib/constants";

interface BuyPackWithXPResponse {
  success: boolean;
  data?: {
    packId: string;
    packType: string;
    totalValue: string;
    isOpened: boolean;
    createdAt: string;
    xpDeducted: number;
    remainingXP: number;
  };
  error?: string;
}

interface BuyPackWithXPResult {
  success: boolean;
  data?: BuyPackWithXPResponse['data'];
  error?: string;
}

export function useBuyPackWithXP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyPackWithXP = async (
    walletAddress: string,
    packType: "BASE" | "PRIME" | "ULTRA"
  ): Promise<BuyPackWithXPResult> => {
    if (!walletAddress) {
      const errorMsg = "Wallet address is required";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post<BuyPackWithXPResponse>(
        `${getApiUrl()}/api/packs/buy-with-xp`,
        {
          address: walletAddress,
          packType,
        }
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        const errorMsg = response.data.error || "Failed to purchase pack with XP";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error("Error buying pack with XP:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to purchase pack with XP";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    buyPackWithXP,
    loading,
    error,
  };
}
