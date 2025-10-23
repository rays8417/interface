"use client";

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

  const getPackBorderHover = (packType: string) => {
    switch (packType.toLowerCase()) {
      case 'base':
        return 'hover:border-slate-500/50';
      case 'prime':
        return 'hover:border-purple-500/50';
      case 'ultra':
        return 'hover:border-amber-500/50';
      default:
        return 'hover:border-primary/50';
    }
  };

  const getSharesInfo = (packType: string) => {
    switch (packType.toLowerCase()) {
      case 'base':
        return 'Contains 150-700 Shares Per Player';
      case 'prime':
        return 'Contains 350-1,800 Shares Per Player';
      case 'ultra':
        return 'Contains 750-3,500 Shares Per Player';
      default:
        return 'Contains player shares';
    }
  };

  return (
    <div className={`group border border-border rounded-xl overflow-hidden bg-card ${getPackBorderHover(pack.packType)} transition-all duration-300 hover:shadow-xl`}>
      {/* Pack Header */}
      <div className={`relative h-56 bg-gradient-to-br ${getPackGradient(pack.packType)} flex items-center justify-center overflow-hidden`}>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20">
            {pack.packType.toUpperCase()}
          </span>
        </div>
        
        {/* Pack Icon */}
        <svg 
          className={`w-28 h-28 text-white/90 group-hover:scale-110 transition-transform duration-300 ${
            pack.packType.toLowerCase() === 'ultra' ? 'group-hover:rotate-12' : ''
          }`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          {getPackIcon(pack.packType)}
        </svg>
      </div>

      {/* Pack Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">{pack.packType}</h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              B
            </div>
            <span className="text-lg font-bold text-foreground">{parseFloat(pack.totalValue).toFixed(0)}</span>
          </div>
        </div>

        {/* Shares Info */}
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm text-foreground-muted font-medium">{getSharesInfo(pack.packType)}</span>
        </div>

        {/* Action Button */}
        {pack.isOpened ? (
          <button
            onClick={() => onViewDetails?.(pack)}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View Players
          </button>
        ) : (
          <button
            onClick={() => onSeePack?.(pack)}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Open Pack
          </button>
        )}
      </div>
    </div>
  );
}
