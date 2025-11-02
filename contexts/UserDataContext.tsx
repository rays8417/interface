"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "@/lib/constants";

interface XPEntry {
  id: string;
  userId: string;
  type: "XP";
  amount: number;
  playerModuleName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PointEntry {
  id: string;
  userId: string;
  type: "XP" | "VP";
  amount: number;
  playerModuleName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserPoints {
  totalXP: number;
  totalVP: number;
  xpEntries: XPEntry[];
  vpByPlayer: Record<string, number>; // { "playerModuleName": vpAmount }
  allPoints: PointEntry[];
}

interface InvitedUser {
  id: string;
  address: string;
  twitterUsername: string | null;
  createdAt: string;
}

interface UserData {
  id: string;
  address: string;
  twitterUsername: string | null;
  createdAt: string;
  updatedAt: string;
  points: UserPoints;
  inviter: InvitedUser | null;
  invitedUsers: InvitedUser[];
  invitedCount: number;
}

interface UserDataContextType {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  
  // Fetch user data from API
  fetchUserData: (walletAddress: string) => Promise<void>;
  
  // Clear user data (on logout)
  clearUserData: () => void;
  
  // Helper methods for quick access
  getTotalXP: () => number;
  getTotalVP: () => number;
  getVPForPlayer: (playerModuleName: string) => number;
  getAllVPPlayers: () => Array<{ playerModuleName: string; vp: number }>;
  
  // Refresh user data
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | null>(null);

  const fetchUserData = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      setError("Wallet address is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentWalletAddress(walletAddress);

      const response = await axios.get(`${getApiUrl()}/api/users/${walletAddress}`);

      if (response.data.success && response.data.user) {
        setUserData(response.data.user);
      } else {
        setError("Failed to fetch user data");
        setUserData(null);
      }
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch user data");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (currentWalletAddress) {
      await fetchUserData(currentWalletAddress);
    }
  }, [currentWalletAddress, fetchUserData]);

  const clearUserData = useCallback(() => {
    setUserData(null);
    setError(null);
    setCurrentWalletAddress(null);
  }, []);

  const getTotalXP = useCallback(() => {
    return userData?.points?.totalXP || 0;
  }, [userData]);

  const getTotalVP = useCallback(() => {
    return userData?.points?.totalVP || 0;
  }, [userData]);

  const getVPForPlayer = useCallback((playerModuleName: string) => {
    return userData?.points?.vpByPlayer?.[playerModuleName] || 0;
  }, [userData]);

  const getAllVPPlayers = useCallback(() => {
    if (!userData?.points?.vpByPlayer) return [];
    
    return Object.entries(userData.points.vpByPlayer).map(([playerModuleName, vp]) => ({
      playerModuleName,
      vp,
    }));
  }, [userData]);

  const value: UserDataContextType = {
    userData,
    loading,
    error,
    fetchUserData,
    clearUserData,
    getTotalXP,
    getTotalVP,
    getVPForPlayer,
    getAllVPPlayers,
    refreshUserData,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}
