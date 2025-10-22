"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PLAYER_MAPPING } from "@/lib/constants";
import { usePackOpening } from "@/hooks/usePackOpening";

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

interface PackPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: UserPack | null;
}

export default function PackPreviewModal({ isOpen, onClose, pack }: PackPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [packPlayers, setPackPlayers] = useState<PackPlayer[]>([]);
  const [showPreview, setShowPreview] = useState(true); // Controls front/back of the modal
  
  const { loading, error, openPack } = usePackOpening();

  useEffect(() => {
    setMounted(true);
    // Add custom scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(128, 128, 128, 0.3);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(128, 128, 128, 0.5);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setIsFlipped(false);
      setPackPlayers([]);
      setShowPreview(true);
    }
  }, [isOpen]);

  const handleOpenPack = async () => {
    if (!pack) return;
    
    const result = await openPack(pack.id);
    
    if (result.success && result.data) {
      setPackPlayers(result.data.players);
      
      // Trigger flip animation after a short delay
      setTimeout(() => {
        setIsFlipped(true);
        setShowPreview(false); // Hide preview side after flip starts
      }, 1000);
    }
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!pack) return null;

  const modalContent = isOpen && mounted ? createPortal(
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="perspective-1000 w-full max-w-md my-8">
        <div 
          className={`relative w-full min-h-[600px] transition-all duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Front of the modal (Pack Preview) */}
          <div className={`absolute inset-0 w-full backface-hidden bg-surface border border-border rounded-2xl shadow-2xl p-6 md:p-8 ${!showPreview ? 'pointer-events-none' : ''}`}>
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

            {/* Pack Preview Content */}
            <div className="space-y-8">
              <div className="text-center pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-primary font-semibold text-sm uppercase tracking-wide">Mystery Pack</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {pack.packType} Pack
                </h2>
                <p className="text-foreground-muted text-base">
                  Ready to discover your players?
                </p>
              </div>

              {/* Pack Visual */}
              <div className="flex justify-center">
                <div className={`relative w-64 h-64 rounded-3xl bg-gradient-to-br ${
                  pack.packType.toLowerCase() === 'base' ? 'from-slate-600 via-slate-700 to-slate-800' :
                  pack.packType.toLowerCase() === 'prime' ? 'from-purple-600 via-purple-700 to-purple-800' :
                  pack.packType.toLowerCase() === 'ultra' ? 'from-amber-500 via-amber-600 to-amber-700' :
                  'from-primary/70 via-primary/80 to-primary/90'
                } shadow-2xl border-2 border-white/10 overflow-hidden`}>
                  
                  {/* Pack Header */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white font-bold text-sm">{pack.packType.toUpperCase()}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white font-bold text-sm">{pack.players?.length || 0} Players</span>
                    </div>
                  </div>

                  {/* Central Mystery Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Glowing circle */}
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                      
                      {/* Main icon */}
                      <div className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                        <svg 
                          className="w-10 h-10 text-white animate-bounce" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {pack.packType.toLowerCase() === 'base' ? (
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          ) : pack.packType.toLowerCase() === 'prime' ? (
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          ) : pack.packType.toLowerCase() === 'ultra' ? (
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          ) : (
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          )}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Pack Footer */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">B</span>
                        </div>
                        <span className="text-white font-bold">{parseFloat(pack.totalValue).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
                </div>
              </div>

            

              {/* Open Pack Button */}
              <div className="relative pt-2">
                <button
                  onClick={handleOpenPack}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground font-bold text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-3 group border border-primary/20"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Opening Pack...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span>Open Pack</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 group-hover:-rotate-12 transition-transform duration-300"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Back of the modal (Pack Opening Results) */}
          <div className={`absolute inset-0 w-full backface-hidden rotate-y-180 bg-surface border border-border rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto custom-scrollbar ${showPreview ? 'pointer-events-none' : ''}`}>
            <div className="space-y-6 min-h-full flex flex-col">
              <div className="text-center pt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-full mb-4">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Pack Opened!
                </h2>
                <p className="text-foreground-muted text-base">
                  Here are your players
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mb-4"></div>
                  <p className="text-foreground-muted">Opening your pack...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Players List */}
              {packPlayers.length > 0 && (
                <div className="space-y-4 flex-grow">
                  <h3 className="text-lg font-semibold text-foreground text-center pb-2">Your Players</h3>
                  <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {packPlayers.filter(player => player && player.player).map((player, index) => {
                      const playerInfo = getPlayerInfo(player.player);
                      return (
                        <div 
                          key={index}
                          className="bg-surface-elevated border border-border rounded-xl p-4 flex items-center gap-4 animate-player-reveal hover:border-border-strong transition-colors"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden border-2 border-primary/20">
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
                          <div className="flex-grow min-w-0">
                            <div className="font-semibold text-base text-foreground truncate">{playerInfo.displayName}</div>
                            <div className="text-sm text-foreground-muted">
                              {playerInfo.team} • {playerInfo.position}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-base text-primary">
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

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-3 px-6 bg-surface-elevated hover:bg-surface border border-border hover:border-border-strong text-foreground font-semibold rounded-xl transition-all duration-200 mt-2"
              >
                Close
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