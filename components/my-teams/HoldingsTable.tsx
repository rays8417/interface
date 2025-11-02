import EmptyState from "../ui/EmptyState";
import { useUserData } from "@/contexts/UserDataContext";

interface Holding {
  id: string;
  playerName: string;
  moduleName: string;
  team: string;
  position: "BAT" | "BWL" | "AR" | "WK";
  price: number;
  shares: number;
  holdings: number;
  avatar: string;
  imageUrl: string;
}

interface HoldingsTableProps {
  holdings: Holding[];
  className?: string;
}

export default function HoldingsTable({ holdings, className = "" }: HoldingsTableProps) {
  const { getVPForPlayer } = useUserData();
  
  return (
    <div className={`mt-8 bg-card border border-border rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="grid grid-cols-11 gap-4 px-6 py-4 border-b border-border bg-surface">
        <div className="col-span-4 text-xs uppercase tracking-wider text-foreground-muted font-medium">
          PLAYER
        </div>
        <div className="col-span-3 text-xs uppercase tracking-wider text-foreground-muted font-medium text-right">
          PRICE (BOSON)
        </div>
        <div className="col-span-2 text-xs uppercase tracking-wider text-foreground-muted font-medium text-right">
          SHARES
        </div>
        <div className="col-span-2 text-xs uppercase tracking-wider text-foreground-muted font-medium text-right">
          VP
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {holdings.length === 0 ? (
          <EmptyState
            title="No players found matching your search."
            className="py-12"
          />
        ) : (
          holdings.map((holding) => {
            const vp = getVPForPlayer(holding.moduleName);
            
            return (
              <div key={holding.id} className="grid grid-cols-11 gap-4 px-6 py-4 hover:bg-surface-elevated/50 transition-colors">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden">
                    {holding.imageUrl ? (
                      <img
                        src={holding.imageUrl}
                        alt={holding.playerName}
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
                      style={{ display: holding.imageUrl ? "none" : "flex" }}
                    >
                      {holding.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{holding.playerName}</div>
                    <div className="text-sm text-foreground-muted">
                      {holding.team} • {holding.position}
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      B
                    </div>
                    <span className="font-medium text-foreground">
                      {holding.price.toFixed(6)}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-medium text-foreground">
                    {holding.shares.toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  {vp > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span className="font-semibold text-blue-500">
                        {vp.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-foreground-muted text-sm">-</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

