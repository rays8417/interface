"use client";

import { useState } from "react";

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

interface PackCardProps {
  pack: UserPack;
  onOpenPack?: (packId: string) => void;
  onViewDetails?: (pack: UserPack) => void;
  onSeePack?: (pack: UserPack) => void;
  isLoading?: boolean;
}

export default function PackCard({ pack, onOpenPack, onViewDetails, onSeePack, isLoading }: PackCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  const getPackIcon = (packType: string) => {
    switch (packType.toLowerCase()) {
      case 'base':
        return (
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        );
      case 'prime':
        return (
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        );
      case 'ultra':
        return (
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        );
      default:
        return (
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`group border border-border rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl ${
        isHovered ? 'scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pack Header */}
      <div className={`relative h-32 bg-gradient-to-br ${getPackGradient(pack.packType)} flex items-center justify-center overflow-hidden`}>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20">
            {pack.packType.toUpperCase()}
          </span>
        </div>
        
        {/* Pack Icon */}
        <svg 
          className={`w-16 h-16 text-white/90 transition-transform duration-300 ${
            pack.packType.toLowerCase() === 'ultra' ? 'group-hover:rotate-12' : 'group-hover:scale-110'
          }`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          {getPackIcon(pack.packType)}
        </svg>

        {/* Status Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            pack.isOpened 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
          }`}>
            {pack.isOpened ? 'Opened' : 'Unopened'}
          </span>
        </div>
      </div>

      {/* Pack Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-foreground">{pack.packType}</h3>
          <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-lg">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              B
            </div>
            <span className="text-sm font-bold text-foreground">{parseFloat(pack.totalValue).toFixed(2)}</span>
          </div>
        </div>

        {/* Pack Info */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-foreground-muted">Purchased:</span>
            <span className="text-foreground">{formatDate(pack.createdAt)}</span>
          </div>
          
          {pack.isOpened && pack.players && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground-muted">Players:</span>
              <span className="text-foreground">{pack.players.length}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {pack.isOpened ? (
            <button
              onClick={() => onViewDetails?.(pack)}
              className="w-full py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Players
            </button>
          ) : (
            <button
              onClick={() => onSeePack?.(pack)}
              className="w-full py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              See Pack
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
