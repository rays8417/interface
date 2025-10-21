"use client";

import { useRouter } from "next/navigation";
import { PlayerInfo, PlayerPosition } from "@/lib/constants";

interface PlayerCardProps {
  player: PlayerInfo;
}

const POSITION_LABELS: Record<PlayerPosition, string> = {
  BAT: "Batsman",
  BWL: "Bowler",
  AR: "All-rounder",
  WK: "Wicketkeeper",
};

const POSITION_COLORS: Record<PlayerPosition, string> = {
  BAT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  BWL: "bg-red-500/10 text-red-500 border-red-500/20",
  AR: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  WK: "bg-green-500/10 text-green-500 border-green-500/20",
};

const POSITION_GRADIENT: Record<PlayerPosition, string> = {
  BAT: "from-blue-500/5 to-blue-500/0",
  BWL: "from-red-500/5 to-red-500/0",
  AR: "from-purple-500/5 to-purple-500/0",
  WK: "from-green-500/5 to-green-500/0",
};

export default function PlayerCard({ player }: PlayerCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to swaps page with player name as query param
    router.push(`/swaps?player=${encodeURIComponent(player.name)}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative border border-border rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${POSITION_GRADIENT[player.position]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative p-5">
        {/* Header: Avatar + Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300">
              {player.imageUrl ? (
                <img
                  src={player.imageUrl}
                  alt={player.displayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <span 
                className="text-xl font-bold text-primary items-center justify-center w-full h-full"
                style={{ display: player.imageUrl ? "none" : "flex" }}
              >
                {player.avatar}
              </span>
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground mb-1.5 truncate group-hover:text-primary transition-colors">
              {player.displayName}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground-muted">
                {player.team}
              </span>
            </div>

            <span
              className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${
                POSITION_COLORS[player.position]
              }`}
            >
              {POSITION_LABELS[player.position]}
            </span>
          </div>
        </div>

        {/* Token Symbol */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border/50">
          <div className="text-xs text-foreground-subtle font-medium mb-1">Token Symbol</div>
          <div className="text-sm text-foreground font-mono font-semibold truncate">
            {player.name.replace(/\s+/g, "")}
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleClick}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
            />
          </svg>
          <span>Trade Shares</span>
        </button>
      </div>
    </div>
  );
}

