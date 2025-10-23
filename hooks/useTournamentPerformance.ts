import { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "@/lib/constants";
import { useTournamentDataContext } from "@/contexts/TournamentDataContext";

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

export function useTournamentPerformance(tournamentId?: string) {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { getPerformanceCache, setPerformanceCache } = useTournamentDataContext();

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = getPerformanceCache(tournamentId);
    if (cached) {
      setPlayerScores(cached.playerScores);
      setLoading(false);
      return;
    }

    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${getApiUrl()}/api/tournaments/${tournamentId}`
        );
        const scores = response.data.tournament.playerScores || [];
        setPlayerScores(scores);
        // Cache the fetched data
        setPerformanceCache(tournamentId, scores);
      } catch (error) {
        console.error("Error fetching tournament performance:", error);
        setPlayerScores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [tournamentId, getPerformanceCache, setPerformanceCache]);

  return { playerScores, loading };
}

