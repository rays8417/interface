"use client";

import { useRef, useState } from "react";
import { X, Download, Twitter } from "lucide-react";
import toast from "react-hot-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: number;
  rewards: number;
  walletAddress: string;
}

export default function ShareModal({ isOpen, onClose, rank, rewards, walletAddress }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatWalletAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatRewards = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const generateCardCanvas = async () => {
    if (!cardRef.current) {
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

    const source = cardRef.current;
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
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await generateCardCanvas();
      
      const link = document.createElement("a");
      link.download = `tenjaku-leaderboard-rank-${rank}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error downloading card:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const shareOnTwitter = async () => {
    if (!cardRef.current) return;
    
    try {
      toast.loading("Generating card image...", { id: "twitter-share" });
      
      // Generate image from card
      const canvas = await generateCardCanvas();
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image", { id: "twitter-share" });
          return;
        }
        
        // Try to copy image to clipboard
        try {
          // Check if ClipboardItem is supported
          if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            
            toast.success("✓ Card image copied! Open Twitter and paste (Ctrl+V / Cmd+V) to add it.", { 
              id: "twitter-share",
              duration: 5000 
            });
            
            // Small delay to ensure clipboard is ready, then open Twitter
            setTimeout(() => {
              const text = `I'm ranked #${rank} on @tenjakudotfun Leaderboard with ${formatRewards(rewards)} rewards! 🎮\n\nJoin the competition and show your skills! 🚀\n\n#Tenjaku #FantasySports`;
              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
            }, 300);
          } else {
            throw new Error("Clipboard API not supported");
          }
        } catch (err) {
          console.log("Clipboard copy failed, falling back to download:", err);
          
          // Fallback: Create a data URL and copy to clipboard as image
          const dataUrl = canvas.toDataURL('image/png');
          
          // Try alternative clipboard method
          try {
            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
              
              toast.success("✓ Card image copied! Open Twitter and paste (Ctrl+V / Cmd+V) to add it.", { 
                id: "twitter-share",
                duration: 5000 
              });
              
              setTimeout(() => {
                const text = `I'm ranked #${rank} on @tenjakudotfun Leaderboard with ${formatRewards(rewards)} rewards! 🎮\n\nJoin the competition and show your skills! 🚀\n\n#Tenjaku #FantasySports`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(url, "_blank");
              }, 300);
            } else {
              throw new Error("Clipboard API not available");
            }
          } catch (fallbackErr) {
            // Final fallback: download image and open Twitter
            const link = document.createElement("a");
            link.download = `tenjaku-leaderboard-rank-${rank}.png`;
            link.href = dataUrl;
            link.click();
            
            toast.success("Card downloaded! Upload it when composing your tweet.", { 
              id: "twitter-share",
              duration: 5000 
            });
            
            setTimeout(() => {
              const text = `I'm ranked #${rank} on @tenjakudotfun Leaderboard with ${formatRewards(rewards)} rewards! 🎮\n\nJoin the competition and show your skills! 🚀\n\n#Tenjaku #FantasySports`;
              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
            }, 500);
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error("Error sharing on Twitter:", error);
      toast.error("Failed to generate card image", { id: "twitter-share" });
      
      // Fallback to text-only share
      const text = `I'm ranked #${rank} on @tenjakudotfun Leaderboard with ${formatRewards(rewards)} rewards! 🎮\n\nJoin the competition and show your skills! 🚀\n\n#Tenjaku #FantasySports`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
  <div className="relative w-full max-w-3xl mx-4 bg-surface border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Share Your Achievement</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-foreground-muted" />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Shareable Card */}
          <div
            ref={cardRef}
            className="relative w-[640px] h-[400px] bg-gradient-to-br from-[#F9E58B] via-[#F7C452] to-[#F18E2A] rounded-2xl overflow-hidden border border-yellow-400/80 shadow-[0_20px_60px_rgba(241,142,42,0.35)] mx-auto"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.6),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(255,255,255,0.35),transparent_60%)]" />
              <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[linear-gradient(135deg,rgba(255,255,255,0.35),rgba(255,255,255,0)_30%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.25))]" />
              <div className="absolute -left-24 top-16 w-72 h-72 bg-gradient-to-br from-[#FFF8C9] to-transparent rounded-full blur-3xl opacity-80" />
              <div className="absolute -right-24 bottom-10 w-60 h-60 bg-gradient-to-br from-[#FFE8A3] to-transparent rounded-full blur-3xl opacity-70" />
            </div>

            {/* Content Container */}
            <div className="relative h-full px-8 py-8 grid grid-rows-[auto,1fr,auto]">
              {/* Top Section - Brand */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#2D1A00] mb-1 tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]">TENJAKU</h3>
                  
                </div>
                <div className="px-3 py-1.5 bg-gradient-to-br from-[#FFF4C5]/60 via-[#FFD75A]/70 to-[#F6AE2D]/60 border border-yellow-500/50 rounded-lg shadow-lg shadow-yellow-500/40 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-[#4D2E00] uppercase tracking-wider">Top Player</span>
                </div>
              </div>

              {/* Center Section - Main Stats */}
              <div className="flex flex-col justify-center gap-12">
                {/* Rank Display */}
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#FFF6D6] via-[#FFD968] to-[#F4A53D] rounded-[1.75rem] flex items-center justify-center shadow-[0_15px_35px_rgba(244,165,61,0.45)] rotate-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/45 via-transparent to-transparent rounded-[1.75rem]" />
                      <span className="text-3xl font-black text-[#5C3B00] relative z-10 drop-shadow-[0_4px_6px_rgba(255,255,255,0.4)]">#{rank}</span>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-[#FFD45E]/60 blur-2xl rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#5C3B00] uppercase tracking-wider mb-1 font-semibold">Your Rank</p>
                    <p className="text-3xl font-extrabold text-[#1A0E00] drop-shadow-[0_3px_10px_rgba(255,255,255,0.35)]">Position #{rank}</p>
                  </div>
                </div>

                {/* Rewards Display */}
                <div>
                  <p className="text-xs text-[#5C3B00] uppercase tracking-wider mb-1.5 font-semibold">Total Rewards Earned</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FFF7D9] to-[#F2B13D] rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(242,177,61,0.45)] flex-shrink-0">
                      <span className="text-[#2D1A00] font-extrabold text-sm">B</span>
                    </div>
                    <span className="text-3xl font-extrabold text-[#1A0E00] tracking-tight drop-shadow-[0_3px_8px_rgba(255,255,255,0.35)]">{formatRewards(rewards)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Wallet & Footer */}
              <div className="flex items-end justify-between pt-4">
                <div>
                  <p className="text-xs text-[#5C3B00] uppercase tracking-wider mb-1 font-semibold">Wallet</p>
                  <p className="text-sm font-mono text-[#3A2500] font-semibold">{formatWalletAddress(walletAddress)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#1A0E00] drop-shadow-[0_2px_6px_rgba(255,255,255,0.4)]">Tenjaku.fun</p>
                </div>
              </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(255,255,255,0.5),transparent_70%)] opacity-60" />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-[radial-gradient(circle,rgba(255,220,120,0.55),transparent_70%)] opacity-70" />
            <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={downloadCard}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface-elevated hover:bg-muted border border-border rounded-lg transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 text-foreground-muted" />
              <span className="text-sm font-medium text-foreground">
                {isDownloading ? "Downloading..." : "Download"}
              </span>
            </button>
            <button
              onClick={shareOnTwitter}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-lg transition-all shadow-lg shadow-[#1DA1F2]/20"
            >
              <Twitter className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Share on X</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

