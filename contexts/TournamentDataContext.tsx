"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface PlayerScore {
  id: string;
  tournamentId: string;
  playerId: string | null;
  moduleName: string;
  runs: number;
  ballsFaced: number;
  wickets: number;
  oversBowled: string;
  runsConceded: number;
  catches: number;
  stumpings: number;
  runOuts: number;
  fantasyPoints: string;
  createdAt: string;
  updatedAt: string;
  player: any | null;
}

interface TournamentPlayerData {
  id: string;
  moduleName: string;
  name: string;
  team: string;
  role: string;
  fantasyPoints: string;
}

interface CachedTournamentPlayers {
  players: TournamentPlayerData[];
  timestamp: number;
  walletAddress?: string;
}

interface CachedTournamentPerformance {
  playerScores: PlayerScore[];
  timestamp: number;
}

interface TournamentDataContextType {
  // Cache for tournament players (eligible players)
  getPlayersCache: (tournamentId: string, walletAddress?: string) => CachedTournamentPlayers | null;
  setPlayersCache: (tournamentId: string, players: TournamentPlayerData[], walletAddress?: string) => void;
  
  // Cache for tournament performance (completed tournaments)
  getPerformanceCache: (tournamentId: string) => CachedTournamentPerformance | null;
  setPerformanceCache: (tournamentId: string, playerScores: PlayerScore[]) => void;
  
  // Clear cache (called on page/route refresh)
  clearCache: () => void;
  
  // Pre-fetch functions
  prefetchTournamentPlayers: (tournamentId: string, tournamentStatus: string, walletAddress?: string) => Promise<void>;
  prefetchTournamentPerformance: (tournamentId: string) => Promise<void>;
}

const TournamentDataContext = createContext<TournamentDataContextType | undefined>(undefined);

interface TournamentDataProviderProps {
  children: ReactNode;
}

export function TournamentDataProvider({ children }: TournamentDataProviderProps) {
  const [playersCache, setPlayersCacheState] = useState<Map<string, CachedTournamentPlayers>>(new Map());
  const [performanceCache, setPerformanceCacheState] = useState<Map<string, CachedTournamentPerformance>>(new Map());

  const getPlayersCache = useCallback((tournamentId: string, walletAddress?: string): CachedTournamentPlayers | null => {
    const key = walletAddress ? `${tournamentId}-${walletAddress}` : tournamentId;
    return playersCache.get(key) || null;
  }, [playersCache]);

  const setPlayersCache = useCallback((tournamentId: string, players: TournamentPlayerData[], walletAddress?: string) => {
    const key = walletAddress ? `${tournamentId}-${walletAddress}` : tournamentId;
    setPlayersCacheState((prev) => {
      const newCache = new Map(prev);
      newCache.set(key, {
        players,
        timestamp: Date.now(),
        walletAddress,
      });
      return newCache;
    });
  }, []);

  const getPerformanceCache = useCallback((tournamentId: string): CachedTournamentPerformance | null => {
    return performanceCache.get(tournamentId) || null;
  }, [performanceCache]);

  const setPerformanceCache = useCallback((tournamentId: string, playerScores: PlayerScore[]) => {
    setPerformanceCacheState((prev) => {
      const newCache = new Map(prev);
      newCache.set(tournamentId, {
        playerScores,
        timestamp: Date.now(),
      });
      return newCache;
    });
  }, []);

  const clearCache = useCallback(() => {
    setPlayersCacheState(new Map());
    setPerformanceCacheState(new Map());
  }, []);

  const prefetchTournamentPlayers = useCallback(async (
    tournamentId: string,
    tournamentStatus: string,
    walletAddress?: string
  ) => {
    // Only pre-fetch for upcoming tournaments (live/ongoing tournaments use polling)
    if (tournamentStatus !== "UPCOMING") return;

    const key = walletAddress ? `${tournamentId}-${walletAddress}` : tournamentId;
    // Check if already cached
    if (playersCache.has(key)) return;

    try {
      const { getApiUrl } = await import("@/lib/constants");
      const axios = (await import("axios")).default;
      
      const url = walletAddress
        ? `${getApiUrl()}/api/tournaments/${tournamentId}/eligible-players?address=${walletAddress}`
        : `${getApiUrl()}/api/tournaments/${tournamentId}/eligible-players`;
      
      const response = await axios.get(url);
      const eligiblePlayers = response.data.players || [];

      const players = eligiblePlayers.map((player: any) => ({
        id: player.id,
        moduleName: player.moduleName,
        name: player.name,
        team: player.teamName || "",
        role: player.role || "",
        fantasyPoints: player.formattedHoldings || "0",
      }));

      setPlayersCache(tournamentId, players, walletAddress);
    } catch (error) {
      console.error("Error pre-fetching tournament players:", error);
    }
  }, [playersCache, setPlayersCache]);

  const prefetchTournamentPerformance = useCallback(async (tournamentId: string) => {
    // Check if already cached
    if (performanceCache.has(tournamentId)) return;

    try {
      const { getApiUrl } = await import("@/lib/constants");
      const axios = (await import("axios")).default;
      
      const response = await axios.get(
        `${getApiUrl()}/api/tournaments/${tournamentId}`
      );
      
      const playerScores = response.data.tournament.playerScores || [];
      setPerformanceCache(tournamentId, playerScores);
    } catch (error) {
      console.error("Error pre-fetching tournament performance:", error);
    }
  }, [performanceCache, setPerformanceCache]);

  const value: TournamentDataContextType = {
    getPlayersCache,
    setPlayersCache,
    getPerformanceCache,
    setPerformanceCache,
    clearCache,
    prefetchTournamentPlayers,
    prefetchTournamentPerformance,
  };

  return (
    <TournamentDataContext.Provider value={value}>
      {children}
    </TournamentDataContext.Provider>
  );
}

export function useTournamentDataContext() {
  const context = useContext(TournamentDataContext);
  if (context === undefined) {
    throw new Error("useTournamentDataContext must be used within a TournamentDataProvider");
  }
  return context;
}

