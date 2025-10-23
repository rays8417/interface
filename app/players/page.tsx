"use client";

import { useMemo, useState } from "react";
import { getAllPlayerInfos, PlayerPosition } from "@/lib/constants";
import SearchBar from "@/components/ui/SearchBar";
import EmptyState from "@/components/ui/EmptyState";
import PlayerCard from "@/components/players/PlayerCard";
import PurchasePackModal from "@/components/packs/PurchasePackModal";
import { useWallet } from "@/hooks/useWallet";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useVaultDeposit } from "@/hooks/useVaultDeposit";
import { useLiquidityPairs } from "@/hooks/useLiquidityPairs";
import { usePackOpening } from "@/hooks/usePackOpening";

type FilterOption = "All" | "BAT" | "BWL" | "AR" | "WK";

const POSITION_LABELS: Record<PlayerPosition, string> = {
  BAT: "Batsmen",
  BWL: "Bowlers",
  AR: "All-rounders",
  WK: "Wicketkeepers",
};

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<FilterOption>("All");
  const [loadingPacks, setLoadingPacks] = useState<Record<string, boolean>>({
    base: false,
    prime: false,
    ultra: false
  });

  // Pack opening modal states
  const [showPackOpening, setShowPackOpening] = useState(false);
  const [currentPack, setCurrentPack] = useState<{
    packId: string;
    packType: string;
    totalValue: number;
  } | null>(null);

  const { account } = useWallet();
  const { availableTokens, loading: tokensLoading } = useLiquidityPairs();
  const { balances, loading: balancesLoading, refetch: refetchBalances } = useTokenBalances(account?.address, availableTokens);
  const { executeDeposit } = useVaultDeposit();
  const { getLatestUnopenedPack } = usePackOpening();

  const allPlayers = getAllPlayerInfos();

  const handlePackOpen = async (packType: string, amount: number) => {
    if (!account) {
      console.error("No account connected");
      return;
    }
    
    const packKey = packType.toLowerCase();
    setLoadingPacks(prev => ({ ...prev, [packKey]: true }));

    try {
      // Get current balance, default to 0 if not loaded yet
      const bosonBalance = balances.boson ?? 0;
      
      // Execute the deposit transaction
      const depositResult = await executeDeposit(account, amount, bosonBalance);
      
      if (depositResult.success) {
        // Show modal immediately with loading state
        const packData = {
          packId: `loading_${packType}_${Date.now()}`, // Temporary ID while loading
          packType: packType.charAt(0).toUpperCase() + packType.slice(1),
          totalValue: amount
        };

        setCurrentPack(packData);
        setShowPackOpening(true);
        
        // After showing modal, get the latest unopened pack
        const packTypeUpper = packType.toUpperCase();
        const packResult = await getLatestUnopenedPack(account.address, packTypeUpper);
        
        if (packResult.success && packResult.data) {
          // Update with real pack data from backend
          const realPackData = {
            packId: packResult.data.id,
            packType: packResult.data.packType,
            totalValue: Number(packResult.data.totalValue)
          };

          setCurrentPack(realPackData);
          console.log(`Successfully purchased ${packType} pack!`);
        } else {
          console.error("Failed to get pack data:", packResult.error);
        }
      }
    } catch (error) {
      console.error("Pack opening failed:", error);
    } finally {
      setLoadingPacks(prev => ({ ...prev, [packKey]: false }));
    }
  };

  const handleCloseModal = () => {
    setShowPackOpening(false);
    setCurrentPack(null);
  };

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((player) => {
      const matchesQuery = query.trim()
        ? player.displayName.toLowerCase().includes(query.toLowerCase()) ||
          player.team.toLowerCase().includes(query.toLowerCase())
        : true;

      const matchesPosition =
        selectedPosition === "All" ? true : player.position === selectedPosition;

      return matchesQuery && matchesPosition;
    });
  }, [allPlayers, query, selectedPosition]);

  const positionCounts = useMemo(() => {
    const counts: Record<FilterOption, number> = {
      All: allPlayers.length,
      BAT: 0,
      BWL: 0,
      AR: 0,
      WK: 0,
    };

    allPlayers.forEach((player) => {
      counts[player.position]++;
    });

    return counts;
  }, [allPlayers]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Packs</h1>
          <p className="text-foreground-muted text-sm">
            Each Pack contains 4 to 7 players
          </p>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Base Pack */}
          <div className="group border border-border rounded-xl overflow-hidden bg-card hover:border-slate-500/50 transition-all duration-300 hover:shadow-xl">
            <div className="relative h-56 bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20">
                  BASE
                </span>
              </div>
              <svg className="w-28 h-28 text-white/90 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-foreground">Base</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    B
                  </div>
                  <span className="text-lg font-bold text-foreground">20</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm text-foreground-muted font-medium">Contains 150-700 Shares Per Player</span>
              </div>
              <button 
                onClick={() => handlePackOpen("base", 20)}
                disabled={loadingPacks.base || !account || tokensLoading || balancesLoading || availableTokens.length === 0}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPacks.base ? "Opening..." : tokensLoading || balancesLoading ? "Loading..." : "Open Pack"}
              </button>
            </div>
          </div>

          {/* Prime Pack */}
          <div className="group border border-border rounded-xl overflow-hidden bg-card hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl">
            <div className="relative h-56 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20">
                  PRIME
                </span>
              </div>
              <svg className="w-28 h-28 text-white/90 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-foreground">Prime</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    B
                  </div>
                  <span className="text-lg font-bold text-foreground">50</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm text-foreground-muted font-medium">Contains 350-1,800 Shares Per Player</span>
              </div>
              <button 
                onClick={() => handlePackOpen("prime", 50)}
                disabled={loadingPacks.prime || !account || tokensLoading || balancesLoading || availableTokens.length === 0}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPacks.prime ? "Opening..." : tokensLoading || balancesLoading ? "Loading..." : "Open Pack"}
              </button>
            </div>
          </div>

          {/* Ultra Pack */}
          <div className="group border border-border rounded-xl overflow-hidden bg-card hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl">
            <div className="relative h-56 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20">
                  ULTRA
                </span>
              </div>
              <svg className="w-28 h-28 text-white/90 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-foreground">Ultra</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    B
                  </div>
                  <span className="text-lg font-bold text-foreground">100</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm text-foreground-muted font-medium">Contains 750-3,500 Shares Per Player</span>
              </div>
              <button 
                onClick={() => handlePackOpen("ultra", 100)}
                disabled={loadingPacks.ultra || !account || tokensLoading || balancesLoading || availableTokens.length === 0}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPacks.ultra ? "Opening..." : tokensLoading || balancesLoading ? "Loading..." : "Open Pack"}
              </button>
            </div>
          </div>
        </div>

        {/* Players Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Players</h1>
              <p className="text-foreground-muted text-sm">
                Browse and buy shares of your favorite cricket players
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center px-6 py-3 bg-card border border-border rounded-lg">
                <div className="text-2xl font-bold text-foreground">{allPlayers.length}</div>
                <div className="text-xs text-foreground-muted">Total Players</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search players by name or team..."
            />

            {/* Position Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
              <button
                onClick={() => setSelectedPosition("All")}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedPosition === "All"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-foreground-muted hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                All ({positionCounts.All})
              </button>
              {(Object.keys(POSITION_LABELS) as PlayerPosition[]).map((position) => (
                <button
                  key={position}
                  onClick={() => setSelectedPosition(position)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedPosition === position
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-foreground-muted hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {POSITION_LABELS[position]} ({positionCounts[position]})
                </button>
              ))}
            </div>

            {/* Players Grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-semibold text-foreground">
                  {selectedPosition === "All"
                    ? "All Players"
                    : POSITION_LABELS[selectedPosition]}{" "}
                  <span className="text-foreground-muted">({filteredPlayers.length})</span>
                </div>
                {filteredPlayers.length > 0 && (
                  <div className="text-xs text-foreground-subtle flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Click any card to buy shares
                  </div>
                )}
              </div>

              {filteredPlayers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredPlayers.map((player) => (
                    <PlayerCard key={player.name} player={player} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <svg
                      className="h-12 w-12 text-foreground-subtle"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                  title="No players found"
                  description="Try adjusting your search or filters"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pack Opening Modal */}
      {currentPack && (
        <PurchasePackModal
          isOpen={showPackOpening}
          onClose={handleCloseModal}
          packId={currentPack.packId}
          packType={currentPack.packType}
          totalValue={currentPack.totalValue}
        />
      )}
    </div>
  );
}

