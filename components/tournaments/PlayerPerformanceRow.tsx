import { PLAYER_MAPPING } from "@/lib/constants";

interface PlayerRow {
  id: string;
  name: string;
  points: number;
  holdings: number;
  moduleName: string;
}

interface PlayerPerformanceRowProps {
  player: PlayerRow;
  index: number;
  hidePoints?: boolean;
}

export default function PlayerPerformanceRow({
  player,
  index,
  hidePoints = false,
}: PlayerPerformanceRowProps) {
  const playerInfo = PLAYER_MAPPING[player.moduleName];
  const position = playerInfo?.position || "N/A";
  const imageUrl = playerInfo?.imageUrl || "";

  return (
    <div className="flex items-center justify-between py-3 px-5 border-b border-border/50 last:border-b-0 hover:bg-surface transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="text-sm w-16 text-foreground-muted">
          {position}
        </div>
        <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-surface-elevated border border-border">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={player.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-surface-elevated text-foreground text-sm">
              {player.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-foreground">
            {player.name}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        {!hidePoints && (
          <div className="text-foreground font-semibold min-w-[80px] text-center">
            {player.points}
          </div>
        )}
        <div className="text-foreground font-medium min-w-[100px] text-right">
          {player.holdings > 0 ? (
            <span>{player.holdings.toFixed(2)}</span>
          ) : (
            <span className="text-foreground-muted">0.00</span>
          )}
        </div>
      </div>
    </div>
  );
}

