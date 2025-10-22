"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PLAYER_MAPPING } from "@/lib/constants";

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

interface PackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: UserPack | null;
}

export default function PackDetailsModal({ isOpen, onClose, pack }: PackDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPlayerInfo = (playerName: string) => {
    if (!playerName) {
      return {
        displayName: "Unknown Player",
        name: "Unknown Player",
        team: "UNK",
        position: "UNK" as const,
        avatar: "UN",
        imageUrl: "",
        mint: null
      };
    }

    return PLAYER_MAPPING[playerName] || {
      displayName: playerName,
      name: playerName,
      team: "UNK",
      position: "UNK" as const,
      avatar: playerName.slice(0, 2).toUpperCase(),
      imageUrl: "",
      mint: null
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPackGradient = (packType: string) => {
    switch (packType.toLowerCase()) {
      case 'base':
        return 'from-slate-500 to-slate-700';
      case 'prime':
        return 'from-purple-500 to-purple-700';
      case 'ultra':
        return 'from-amber-400 via-amber-500 to-amber-600';
      default:
        return 'from-primary/60 to-primary/80';
    }
  };

  if (!pack) return null;

  const modalContent = isOpen && mounted ? createPortal(
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm overflow-y-auto transition-all duration-200"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-surface border border-border rounded-xl shadow-2xl max-w-2xl w-full p-5 md:p-6 relative my-8 transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-foreground-muted hover:text-foreground transition-colors z-10"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal content */}
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-3">
              {/* Pack Icon */}
              <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${getPackGradient(pack.packType)} flex items-center justify-center`}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {pack.packType} Pack Details
                </h2>
                <p className="text-sm text-foreground-muted">
                  Opened on {formatDate(pack.createdAt)}
                </p>
              </div>
            </div>

            {/* Pack Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-elevated/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-primary">{parseFloat(pack.totalValue).toFixed(2)}</div>
                <div className="text-xs text-foreground-muted">BOSON Spent</div>
              </div>
              <div className="bg-surface-elevated/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-primary">{pack.players?.length || 0}</div>
                <div className="text-xs text-foreground-muted">Players</div>
              </div>
              <div className="bg-surface-elevated/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-primary">
                  {pack.players?.reduce((total, player) => total + player.amount, 0).toFixed(0) || 0}
                </div>
                <div className="text-xs text-foreground-muted">Total Shares</div>
              </div>
            </div>

            {/* Players List */}
            {pack.players && pack.players.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground text-center">Players in Pack</h3>
                <div className="grid gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {pack.players.filter(player => player && player.player).map((player, index) => {
                    const playerInfo = getPlayerInfo(player.player);
                    return (
                      <div 
                        key={index}
                        className="bg-surface-elevated/50 border border-border rounded-lg p-3 flex items-center gap-3 animate-player-reveal"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden">
                          {playerInfo.imageUrl ? (
                            <img
                              src={playerInfo.imageUrl}
                              alt={playerInfo.displayName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span 
                            className="w-full h-full flex items-center justify-center"
                            style={{ display: playerInfo.imageUrl ? "none" : "flex" }}
                          >
                            {playerInfo.avatar}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate">{playerInfo.displayName}</div>
                          <div className="text-xs text-foreground-muted">
                            {playerInfo.team} • {playerInfo.position}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm text-primary">
                            {player.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-foreground-muted">shares</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={onClose}
                className="flex-1 bg-surface-elevated hover:bg-surface-elevated/80 text-foreground font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => window.location.href = '/players'}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Buy More Packs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return <>{modalContent}</>;
}
