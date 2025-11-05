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
            className="relative w-[640px] h-[400px] bg-gradient-to-br from-[#0a0a0f] via-[#121218] to-[#0a0a0f] rounded-2xl overflow-hidden border border-border/50 shadow-2xl mx-auto"
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
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Leaderboard</p>
                </div>
                <div className="px-3 py-1.5 bg-gradient-to-br from-yellow-500/20 via-yellow-400/25 to-yellow-600/20 border border-yellow-500/40 rounded-lg shadow-lg shadow-yellow-500/20">
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Top Player</span>
                </div>
              </div>

              {/* Center Section - Main Stats */}
              <div className="flex flex-col justify-center gap-12">
                {/* Rank Display */}
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/40 rotate-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                      <span className="text-3xl font-black text-gray-900 relative z-10">#{rank}</span>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-yellow-500/40 blur-xl rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Your Rank</p>
                    <p className="text-2xl font-bold text-white">Position #{rank}</p>
                  </div>
                </div>

                {/* Rewards Display */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Total Rewards Earned</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                      <span className="text-white font-bold text-sm">B</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{formatRewards(rewards)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Wallet & Footer */}
              <div className="flex items-end justify-between pt-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wallet</p>
                  <p className="text-sm font-mono text-gray-300">{formatWalletAddress(walletAddress)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">Tenjaku.fun</p>
                </div>
              </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-3xl" />
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

