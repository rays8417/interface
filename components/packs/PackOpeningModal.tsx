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

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  packId: string;
  packType: string;
  totalValue: number;
}

export default function PackOpeningModal({ 
  isOpen, 
  onClose, 
  packId,
  packType,
  totalValue
}: PackOpeningModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [packPlayers, setPackPlayers] = useState<PackPlayer[]>([]);
  const [showSuccess, setShowSuccess] = useState(true); // Start with success state
  const [hasOpenedPack, setHasOpenedPack] = useState(false);
  
  const { loading, error, openPack } = usePackOpening();

  useEffect(() => {
    setMounted(true);
  }, []);


  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasOpenedPack(false);
      setIsFlipped(false);
      setShowSuccess(true);
      setPackPlayers([]);
    }
  }, [isOpen]);

  const handleOpenPack = async () => {
    setHasOpenedPack(true);
    const result = await openPack(packId);
    
    if (result.success && result.data) {
      setPackPlayers(result.data.players);
      
      // Trigger flip animation after a short delay
      setTimeout(() => {
        setIsFlipped(true);
        setShowSuccess(false);
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

  const modalContent = isOpen && mounted ? createPortal(
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="perspective-1000 w-full max-w-2xl my-8">
        <div 
          className={`relative w-full min-h-[500px] transition-all duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Front of modal (Success State) */}
          <div className={`absolute inset-0 w-full backface-hidden bg-surface border border-border rounded-xl shadow-2xl p-6 md:p-8 ${!showSuccess ? 'pointer-events-none' : ''}`}>
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

              {/* Success content */}
              <div className="space-y-6 text-center pt-2">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-8 w-8 text-green-500"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    Pack Purchased Successfully! 🎉
                  </h2>
                  <p className="text-base text-foreground-muted">
                    {packId.startsWith('loading_') 
                      ? 'Fetching your pack data...' 
                      : 'Your pack is ready to be opened!'}
                  </p>
                </div>

                {/* Pack Details */}
                <div className="bg-surface-elevated/60 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground-muted">Pack Type:</span>
                    <span className="text-sm font-medium text-foreground">{packType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground-muted">Total Value:</span>
                    <span className="text-sm font-medium text-foreground">{Number(totalValue).toFixed(2)} BOSON</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground-muted">Pack ID:</span>
                    <span className="text-sm font-mono text-foreground-muted">{packId.slice(0, 8)}...</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  {packId.startsWith('loading_') && (
                    <div className="w-full bg-primary/20 border border-primary/30 text-primary font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Fetching Pack Data...
                    </div>
                  )}

                  {!packId.startsWith('loading_') && !hasOpenedPack && (
                    <button
                      onClick={handleOpenPack}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20 shadow-lg shadow-primary/20"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {loading ? "Opening..." : "Open Pack"}
                    </button>
                  )}

                  {loading && hasOpenedPack && (
                    <div className="w-full bg-primary/20 border border-primary/30 text-primary font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Opening Pack...
                    </div>
                  )}
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-surface-elevated hover:bg-surface border border-border hover:border-border-strong text-foreground font-medium py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
          </div>

          {/* Back of modal (Opening State) */}
          <div className={`absolute inset-0 w-full backface-hidden rotate-y-180 bg-surface border border-border rounded-xl shadow-2xl p-6 md:p-8 overflow-y-auto custom-scrollbar ${showSuccess ? 'pointer-events-none' : ''}`}>
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

              {/* Opening content */}
              <div className="space-y-6 pt-2">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-full mb-2">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Pack Opened! 🎉
                  </h2>
                  <p className="text-base text-foreground-muted">
                    Here are your players!
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-5 w-5 text-red-500"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-500 font-medium">Error: {error}</span>
                    </div>
                  </div>
                )}

                {/* Players List */}
                {packPlayers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground text-center pb-2">Your Players</h3>
                    <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {packPlayers.filter(player => player && player.player).map((player, index) => {
                        const playerInfo = getPlayerInfo(player.player);
                        return (
                          <div 
                            key={index}
                            className="bg-surface-elevated border border-border rounded-xl p-4 flex items-center gap-4 animate-player-reveal hover:border-border-strong transition-colors"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden border-2 border-primary/20">
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
                    className="flex-1 bg-surface-elevated hover:bg-surface border border-border hover:border-border-strong text-foreground font-medium py-2.5 px-4 rounded-xl transition-all duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.location.href = '/holdings'}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-xl transition-all duration-200"
                  >
                    View Holdings
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return <>{modalContent}</>;
}