"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
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
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

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
        return 'from-slate-600 via-slate-700 to-slate-800';
      case 'prime':
        return 'from-purple-600 via-purple-700 to-purple-800';
      case 'ultra':
        return 'from-amber-500 via-amber-600 to-amber-700';
      default:
        return 'from-primary/70 via-primary/80 to-primary/90';
    }
  };

  const getPackColor = (packType: string) => {
    switch (packType.toLowerCase()) {
      case 'base':
        return { from: 'from-slate-500/20', to: 'to-slate-600/20', border: 'border-slate-500/40', text: 'text-slate-300' };
      case 'prime':
        return { from: 'from-purple-500/20', to: 'to-purple-600/20', border: 'border-purple-500/40', text: 'text-purple-300' };
      case 'ultra':
        return { from: 'from-amber-500/20', to: 'to-amber-600/20', border: 'border-amber-500/40', text: 'text-amber-300' };
      default:
        return { from: 'from-primary/20', to: 'to-primary/30', border: 'border-primary/40', text: 'text-primary' };
    }
  };

  const generateCardCanvas = async () => {
    if (!shareCardRef.current) {
      throw new Error("Share card is not ready yet");
    }

    const disableAnimations = (element: HTMLElement) => {
      element.style.animation = "none";
      element.style.transition = "none";
      element.querySelectorAll<HTMLElement>("*").forEach((child) => {
        child.style.animation = "none";
        child.style.transition = "none";
      });
    };

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch (err) {
      console.warn("Font loading check failed", err);
    }

    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    const source = shareCardRef.current;
    const { width, height } = source.getBoundingClientRect();

    const clone = source.cloneNode(true) as HTMLDivElement;
    clone.style.position = "fixed";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.margin = "0";
    clone.style.transform = "none";
    clone.style.opacity = "1";
    clone.style.pointerEvents = "none";
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.contain = "none";
    clone.style.boxSizing = "border-box";
    clone.style.zIndex = "-1";

    disableAnimations(clone);

    document.body.appendChild(clone);

    const pixelRatio = Math.min(2, window.devicePixelRatio || 2);

    let canvas: HTMLCanvasElement;

    try {
      const { toCanvas } = await import("html-to-image");
      canvas = await toCanvas(clone, {
        backgroundColor: "transparent",
        cacheBust: true,
        pixelRatio,
        width,
        height,
        style: {
          margin: "0",
          transform: "none",
        },
      });
    } catch (err) {
      console.warn("html-to-image failed, falling back to html2canvas", err);
      const html2canvas = (await import("html2canvas")).default;
      canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: pixelRatio,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width,
        height,
        scrollX: 0,
        scrollY: 0,
      });
    } finally {
      document.body.removeChild(clone);
    }

    return canvas;
  };

  const downloadCard = async () => {
    if (!shareCardRef.current || !pack) return;
    
    setIsDownloading(true);
    try {
      const canvas = await generateCardCanvas();
      
      const link = document.createElement("a");
      link.download = `tenjaku-pack-${pack.packType.toLowerCase()}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Pack card downloaded!");
    } catch (error) {
      console.error("Error downloading card:", error);
      toast.error("Failed to download card");
    } finally {
      setIsDownloading(false);
    }
  };

  const shareOnTwitter = async () => {
    if (!shareCardRef.current || !pack) return;
    
    try {
      toast.loading("Generating card image...", { id: "twitter-share" });
      
      const canvas = await generateCardCanvas();
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image", { id: "twitter-share" });
          return;
        }
        
        try {
          if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            
            toast.success("✓ Card image copied! Open X and paste (Ctrl+V / Cmd+V) to add it.", { 
              id: "twitter-share",
              duration: 5000 
            });
            
            setTimeout(() => {
              const totalShares = pack.players?.reduce((sum, p) => sum + p.amount, 0).toFixed(0) || '0';
              const text = `Just opened a ${pack.packType} pack on @tenjakudotfun! 🎮\n\nGot ${pack.players?.length || 0} players with ${totalShares} total shares! 🚀\n\n#Tenjaku #FantasySports`;
              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
            }, 300);
          } else {
            throw new Error("Clipboard API not supported");
          }
        } catch (err) {
          console.log("Clipboard copy failed, falling back to download:", err);
          
          const dataUrl = canvas.toDataURL('image/png');
          
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
              
              toast.success("✓ Card image copied! Open X and paste (Ctrl+V / Cmd+V) to add it.", { 
                id: "twitter-share",
                duration: 5000 
              });
              
              setTimeout(() => {
                const totalShares = pack.players?.reduce((sum, p) => sum + p.amount, 0).toFixed(0) || '0';
                const text = `Just opened a ${pack.packType} pack on @tenjakudotfun! 🎮\n\nGot ${pack.players?.length || 0} players with ${totalShares} total shares! 🚀\n\n#Tenjaku #FantasySports`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(url, "_blank");
              }, 300);
            } else {
              throw new Error("Clipboard API not available");
            }
          } catch (fallbackErr) {
            const link = document.createElement("a");
            link.download = `tenjaku-pack-${pack.packType.toLowerCase()}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            
            toast.success("Card downloaded! Upload it when composing your tweet.", { 
              id: "twitter-share",
              duration: 5000 
            });
            
            setTimeout(() => {
              const totalShares = pack.players?.reduce((sum, p) => sum + p.amount, 0).toFixed(0) || '0';
              const text = `Just opened a ${pack.packType} pack on @tenjakudotfun! 🎮\n\nGot ${pack.players?.length || 0} players with ${totalShares} total shares! 🚀\n\n#Tenjaku #FantasySports`;
              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
            }, 500);
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error("Error sharing on Twitter:", error);
      toast.error("Failed to generate card image", { id: "twitter-share" });
      
      const totalShares = pack.players?.reduce((sum, p) => sum + p.amount, 0).toFixed(0) || '0';
      const text = `Just opened a ${pack.packType} pack on @tenjakudotfun! 🎮\n\nGot ${pack.players?.length || 0} players with ${totalShares} total shares! 🚀\n\n#Tenjaku #FantasySports`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
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

          {/* Share and Download Buttons - Top Right */}
          {pack.players && pack.players.length > 0 && (
            <div className="absolute top-4 right-14 flex items-center gap-2 z-10">
              <button
                onClick={downloadCard}
                disabled={isDownloading}
                className="p-2 bg-surface-elevated hover:bg-muted border border-border rounded-lg transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download"
              >
                <Download className="h-5 w-5 text-foreground-muted" />
              </button>
              <button
                onClick={shareOnTwitter}
                className="p-2 bg-black hover:bg-gray-900 rounded-lg transition-all shadow-lg shadow-black/20"
                aria-label="Share on X"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
            </div>
          )}

          {/* Modal content */}
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-3">
              {/* Pack Icon */}
              <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${getPackGradient(pack.packType)} flex items-center justify-center`}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  {pack.packType.toLowerCase() === 'base' ? (
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  ) : pack.packType.toLowerCase() === 'prime' ? (
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  ) : (
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  )}
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

            {/* Shareable Card - Off-screen but rendered for image generation */}
            {pack.players && pack.players.length > 0 && (
              <div className="fixed left-[-9999px] top-0 pointer-events-none" style={{ visibility: 'hidden' }}>
                <div
                  ref={shareCardRef}
                  className="relative w-[640px] h-[400px] bg-gradient-to-br from-[#0a0a0f] via-[#121218] to-[#0a0a0f] rounded-2xl overflow-hidden border border-border/50 shadow-2xl"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(28,156,240,0.15),transparent_50%)]" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
                  </div>

                  {/* Content Container */}
                  <div className="relative h-full px-8 py-8 grid grid-rows-[auto,1fr,auto]">
                    {/* Top Section - Brand */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">TENJAKU</h3>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">{pack.players?.length || 0} Players added to my team</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 bg-gradient-to-br ${getPackColor(pack.packType).from} ${getPackColor(pack.packType).to} border ${getPackColor(pack.packType).border} rounded-lg shadow-lg`}>
                        <span className={`text-xs font-semibold ${getPackColor(pack.packType).text} uppercase tracking-wider`}>{pack.packType} Pack</span>
                      </div>
                    </div>

                    {/* Center Section - Players */}
                    <div className="flex flex-col justify-center items-center gap-6">
                      {/* Player Circles */}
                      {pack.players && pack.players.length > 0 && (
                        <div className={`grid gap-4 ${
                          pack.players.length <= 4 ? 'grid-cols-4' : 
                          pack.players.length === 5 ? 'grid-cols-5' : 
                          'grid-cols-6'
                        } max-w-full`}>
                          {pack.players.slice(0, 6).map((player, idx) => {
                            const playerInfo = getPlayerInfo(player.player);
                            const getPositionIcon = (position: string) => {
                              switch (position) {
                                case 'BAT':
                                  return (
                                    <img src="/bat.png" alt="Batsman" className="w-10 h-10 object-contain brightness-0 invert" />
                                  );
                                case 'BWL':
                                  return (
                                    <img src="/ball.png" alt="Bowler" className="w-10 h-10 object-contain brightness-0 invert" />
                                  );
                                case 'AR':
                                  return (
                                    <img src="/AR.png" alt="All Rounder" className="w-10 h-10 object-contain brightness-0 invert" />
                                  );
                                case 'WK':
                                  return (
                                    <img src="/stump.png" alt="Wicket Keeper" className="w-10 h-10 object-contain brightness-0 invert" />
                                  );
                                default:
                                  return (
                                    <span className="text-primary font-bold text-lg">{playerInfo.avatar}</span>
                                  );
                              }
                            };
                            return (
                              <div key={idx} className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center shadow-lg flex-shrink-0">
                                  {getPositionIcon(playerInfo.position)}
                                </div>
                                <p className="text-xs font-semibold text-white text-center px-1 leading-tight">{playerInfo.displayName}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Bottom Section - Footer */}
                    <div className="flex items-end justify-between pt-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pack Opened</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">Tenjaku.fun</p>
                      </div>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-3xl" />
                </div>
              </div>
            )}


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
