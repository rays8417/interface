"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import SearchBar from "@/components/ui/SearchBar";
import PlayerPerformanceRow from "./PlayerPerformanceRow";
import EmptyState from "../ui/EmptyState";
import { useTournamentPlayers } from "@/hooks/useTournamentPlayers";
import { usePlayerHoldings } from "@/hooks/usePlayerHoldings";
import { useWallet } from "@/hooks/useWallet";

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  matchDate: string;
  team1: string;
  team2: string;
  venue: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
}

interface PlayerRow {
  id: string;
  name: string;
  points: number;
  holdings: number;
  moduleName: string;
}

interface EligiblePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  showScores?: boolean; // false for upcoming, true for live
}

export default function EligiblePlayersModal({
  isOpen,
  onClose,
  tournament,
  showScores = true,
}: EligiblePlayersModalProps) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const { account } = useWallet();

  const { 
    players: tournamentPlayers, 
    loading: isLoadingPlayers,
    liveInfo 
  } = useTournamentPlayers(
    isOpen ? tournament?.id : undefined,
    tournament?.status,
    account?.address
  );
  const { holdings, loading: isLoadingHoldings } = usePlayerHoldings(account?.address);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const players = useMemo<PlayerRow[]>(() => {
    if (tournamentPlayers.length === 0) return [];

    return tournamentPlayers
      .map((player) => {
        const holding = holdings.find(h => h.moduleName === player.moduleName);

        return {
          id: player.id,
          name: player.name,
          moduleName: player.moduleName,
          points: parseInt(player.fantasyPoints),
          holdings: holding?.shares || 0,
        };
      })
      .sort((a, b) => b.holdings - a.holdings);
  }, [tournamentPlayers, holdings]);

  const visiblePlayers = players.filter((p) => {
    const matchesQuery = query.trim()
      ? p.name.toLowerCase().includes(query.toLowerCase())
      : true;
    return matchesQuery;
  });

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!liveInfo?.lastUpdated) return null;
    
    const now = new Date();
    const lastUpdate = new Date(liveInfo.lastUpdated);
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return lastUpdate.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const modalContent =
    isOpen && mounted
      ? createPortal(
          <div
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-md overflow-y-auto transition-all duration-300"
            style={{ zIndex: 9999 }}
            onClick={onClose}
          >
            <div className="min-h-screen flex items-center justify-center p-4">
              <div
                className="bg-card border border-border rounded-xl max-w-5xl w-full relative my-8 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-6 md:px-8 py-6 border-b border-border relative bg-card">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-foreground-muted hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-5 w-5"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  
                  <div className="space-y-2 pr-12">
                    <h2 className="text-2xl font-bold text-foreground">
                      {tournament?.name || "Tournament Details"}
                    </h2>
                    <div className="flex items-center gap-3 text-foreground-muted text-sm">
                      <span>{tournament?.team1}</span>
                      <span>vs</span>
                      <span>{tournament?.team2}</span>
                      {tournament?.venue && (
                        <>
                          <span>•</span>
                          <span>{tournament.venue}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Eligible Players
                    </h3>
                    {tournament?.status === "ONGOING" && (
                      <div className="flex items-center gap-2">
                        {liveInfo?.lastUpdated && (
                          <span className="text-xs text-foreground-muted">
                            Updated {getLastUpdatedText()}
                          </span>
                        )}
                        {isLoadingPlayers && visiblePlayers.length > 0 && (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" title="Refreshing..."></div>
                        )}
                        {liveInfo?.error && (
                          <span className="text-xs text-error" title={liveInfo.error}>
                            Error loading scores
                          </span>
                        )}
                        <button
                          onClick={() => liveInfo?.refresh?.()}
                          className="text-xs text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
                          disabled={isLoadingPlayers}
                          title="Refresh scores"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Warning about final playing players - only show for upcoming tournaments */}
                  {tournament?.status === "UPCOMING" && (
                    <div className=" border border-orange-500 rounded-lg p-4">
                      <div className="text-center">
                        
                        <p className="text-sm text-orange-400">
                        The final playing players are determined after the toss. The players listed here are eligible but may not all participate in the actual match.
                        </p>
                      </div>
                    </div>
                  )}

                  <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Search players by name..."
                  />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between mb-4 px-4 py-2">
                      <span className="text-sm text-foreground-muted">
                        {visiblePlayers.length} {visiblePlayers.length === 1 ? 'Player' : 'Players'}
                      </span>
                    </div>

                    {isLoadingPlayers || isLoadingHoldings ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                      </div>
                    ) : visiblePlayers.length > 0 ? (
                      <div className="space-y-0">
                        {/* Table Header */}
                        <div className="flex items-center justify-between py-3 px-5 border-b border-border bg-surface">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-xs font-semibold text-foreground-muted w-16">
                              Pos
                            </div>
                            <div className="text-xs font-semibold text-foreground-muted flex-1">
                              Player
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            {showScores && (
                              <div className="text-xs font-semibold text-foreground-muted text-center min-w-[80px]">
                                Points
                              </div>
                            )}
                            <div className="text-xs font-semibold text-foreground-muted text-right min-w-[100px]">
                              Holdings
                            </div>
                          </div>
                        </div>
                        {/* Table Rows */}
                        <div className="bg-card overflow-hidden border border-t-0 border-border max-h-[500px] overflow-y-auto">
                          {visiblePlayers.map((player, idx) => (
                            <PlayerPerformanceRow 
                              key={player.id} 
                              player={player} 
                              index={idx}
                              hidePoints={!showScores}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={
                          <svg
                            className="h-12 w-12 text-foreground-subtle"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        }
                        title="No players found"
                        description="Try adjusting your search or filters"
                      />
                    )}
                    
                    {!showScores && (
                      <div className="mt-4 px-4">
                        <p className="text-xs text-foreground-muted">
                          Scores will be updated once the match starts.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return <>{modalContent}</>;
}

