"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { PLAYER_MAPPING } from "@/lib/constants";
import { usePackOpening } from "@/hooks/usePackOpening";
import { useBalanceRefresh } from "@/hooks/useBalanceRefresh";
import { useUserData } from "@/contexts/UserDataContext";

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
  purchasedWithXP?: boolean;
  xpDeducted?: number;
  remainingXP?: number;
}

export default function PurchasePackModal({ 
  isOpen, 
  onClose, 
  packId,
  packType,
  totalValue,
  purchasedWithXP = false,
  xpDeducted = 0,
  remainingXP = 0,
}: PackOpeningModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [packPlayers, setPackPlayers] = useState<PackPlayer[]>([]);
  const [showSuccess, setShowSuccess] = useState(true); // Start with success state
  const [hasOpenedPack, setHasOpenedPack] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  
  const { loading, error, openPack } = usePackOpening();
  const { triggerRefresh } = useBalanceRefresh();
  const { refreshUserData } = useUserData();

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
      
      // Refresh token balances after successful pack opening
      triggerRefresh();
      
      // Refresh user data to update XP if pack was purchased with XP
      if (purchasedWithXP) {
        await refreshUserData();
      }
      
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
    if (!shareCardRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await generateCardCanvas();
      
      const link = document.createElement("a");
      link.download = `tenjaku-pack-${packType.toLowerCase()}-${Date.now()}.png`;
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
    if (!shareCardRef.current) return;
    
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
              const totalShares = packPlayers.reduce((sum, p) => sum + p.amount, 0).toFixed(0);
              const text = `Just opened a ${packType} pack on @tenjakudotfun! 🎮\n\nGot ${packPlayers.length} players with ${totalShares} total shares! 🚀\n\n#Tenjaku #FantasySports`;
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
                const totalShares = packPlayers.reduce((sum, p) => sum + p.amount, 0).toFixed(0);
                const text = `Just opened a ${packType} pack on @tenjakudotfun! 🎮\n\nGot ${packPlayers.length} players with ${totalShares} total shares! 🚀\n\n#Tenjaku #FantasySports`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(url, "_blank");
              }, 300);
            } else {
              throw new Error("Clipboard API not available");
            }
          } catch (fallbackErr) {
            const link = document.createElement("a");
            link.download = `tenjaku-pack-${packType.toLowerCase()}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            
            toast.success("Card downloaded! Upload it when composing your tweet.", { 
              id: "twitter-share",
              duration: 5000 
            });
            
            setTimeout(() => {
              const totalShares = packPlayers.reduce((sum, p) => sum + p.amount, 0).toFixed(0);
              const text = `Just opened a ${packType} pack on @tenjakudotfun! 🎮\n\nGot ${packPlayers.length} players with ${totalShares} total shares! 🚀\n\n#Tenjaku #FantasySports`;
              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
            }, 500);
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error("Error sharing on Twitter:", error);
      toast.error("Failed to generate card image", { id: "twitter-share" });
      
      const totalShares = packPlayers.reduce((sum, p) => sum + p.amount, 0).toFixed(0);
      const text = `Just opened a ${packType} pack on @tenjakudotfun! 🎮\n\nGot ${packPlayers.length} players with ${totalShares} total shares! 🚀\n\n#Tenjaku #FantasySports`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    }
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
                    {purchasedWithXP ? (
                      <span className="text-sm font-medium text-yellow-500">{xpDeducted} XP</span>
                    ) : (
                      <span className="text-sm font-medium text-foreground">{Number(totalValue).toFixed(2)} BOSON</span>
                    )}
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
            {/* Share and Download Buttons - Top Right */}
            {packPlayers.length > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
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
            <div className="space-y-6 min-h-full flex flex-col">
              <div className="text-center pt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-full mb-4">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    {packType.toLowerCase() === 'base' ? (
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    ) : packType.toLowerCase() === 'prime' ? (
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    ) : (
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    )}
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Pack Opened!
                </h2>
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

              {/* Shareable Card - Off-screen but rendered for image generation */}
              {packPlayers.length > 0 && (
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
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{packPlayers.length} Players added to my team</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 bg-gradient-to-br ${getPackColor(packType).from} ${getPackColor(packType).to} border ${getPackColor(packType).border} rounded-lg shadow-lg`}>
                          <span className={`text-xs font-semibold ${getPackColor(packType).text} uppercase tracking-wider`}>{packType} Pack</span>
                        </div>
                      </div>

                      {/* Center Section - Players */}
                      <div className="flex flex-col justify-center items-center gap-6">
                        {/* Player Circles */}
                        <div className={`grid gap-4 ${
                          packPlayers.length <= 4 ? 'grid-cols-4' : 
                          packPlayers.length === 5 ? 'grid-cols-5' : 
                          'grid-cols-6'
                        } max-w-full`}>
                          {packPlayers.slice(0, 6).map((player, idx) => {
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


              <div className="flex gap-3 pt-2 mt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 bg-surface-elevated hover:bg-surface border border-border hover:border-border-strong text-foreground font-semibold rounded-xl transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.href = '/holdings'}
                  className="flex-1 py-3 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200"
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