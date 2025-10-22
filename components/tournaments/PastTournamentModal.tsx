"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PLAYER_MAPPING } from "@/lib/constants";
import { useTournamentPerformance } from "@/hooks/useTournamentPerformance";

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

interface PastTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
}

export default function PastTournamentModal({
  isOpen,
  onClose,
  tournament,
}: PastTournamentModalProps) {
  const [mounted, setMounted] = useState(false);
  
  // Use the existing hook to fetch tournament performance data
  const { playerScores, loading } = useTournamentPerformance(
    isOpen ? tournament?.id : undefined
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sort players by fantasy points (descending)
  const sortedPlayers = [...playerScores].sort(
    (a, b) => parseFloat(b.fantasyPoints) - parseFloat(a.fantasyPoints)
  );

  const getPlayerInfo = (moduleName: string) => {
    // Only return players in PLAYER_MAPPING (no fallback data)
    return PLAYER_MAPPING[moduleName] || null;
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

                {/* Modal content */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Player Performances
                    </h3>
                    {!loading && sortedPlayers.length > 0 && (
                      <span className="text-sm text-foreground-muted">
                        {sortedPlayers.length} Players
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : sortedPlayers.length === 0 ? (
                    <div className="text-center py-16 bg-surface rounded-lg border border-border">
                      <svg className="mx-auto h-12 w-12 text-foreground-subtle mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-foreground-muted">No player data available</p>
                    </div>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto border border-border rounded-lg bg-card">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-surface border-b border-border z-10">
                          <tr>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-foreground-muted">
                              Rank
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-muted">
                              Player
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-foreground-muted">
                              Runs
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-foreground-muted">
                              Wickets
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-foreground-muted">
                              Points
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedPlayers.map((player, index) => {
                            const playerInfo = getPlayerInfo(player.moduleName);
                            // Skip players not in PLAYER_MAPPING (no fallback data)
                            if (!playerInfo) return null;
                            
                            const isTop3 = index < 3;
                            
                            return (
                              <tr
                                key={player.id}
                                className="border-b border-border/50 last:border-b-0 hover:bg-surface transition-colors"
                              >
                                <td className="py-4 px-4">
                                  <div className="flex items-center justify-center">
                                    <span className="text-foreground-muted font-medium">
                                      {index + 1}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    {playerInfo.imageUrl ? (
                                      <img
                                        src={playerInfo.imageUrl}
                                        alt={playerInfo.displayName}
                                        className="w-10 h-10 rounded-lg border border-border object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-foreground text-sm border border-border">
                                        {playerInfo.avatar}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium text-foreground">
                                        {playerInfo.displayName}
                                      </div>
                                      <div className="text-xs text-foreground-muted">
                                        {playerInfo.team} • {playerInfo.position}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className="text-foreground font-medium">
                                    {player.runs}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className="text-foreground font-medium">
                                    {player.wickets}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <span className="text-foreground font-semibold">
                                    {parseFloat(player.fantasyPoints).toFixed(2)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return <>{modalContent}</>;
}

