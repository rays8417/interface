"use client";

import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import RewardsSummary from "@/components/my-teams/RewardsSummary";
import HoldingsTable from "@/components/my-teams/HoldingsTable";
import PacksSection from "@/components/packs/PacksSection";
import { useUserRewards } from "@/hooks/useUserRewards";
import { usePlayerHoldings } from "@/hooks/usePlayerHoldings";

export default function MyTeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { account } = useWallet();
  const address = account?.address;

  const { userRewards, loading: rewardsLoading } = useUserRewards(address);
  const { holdings, loading, error } = usePlayerHoldings(address);

  const filteredHoldings = holdings
    .filter(
      (holding) =>
        holding.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        holding.team.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.shares - a.shares); // Sort by shares in descending order

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Rewards & Player Holdings</h1>
            <p className="text-foreground-muted text-sm">
              Track your player holdings and accumulated rewards
            </p>
          </div>
          <LoadingSpinner size="lg" text="Loading player data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Rewards & Player Holdings</h1>
            <p className="text-foreground-muted text-sm">
              Track your player holdings and accumulated rewards
            </p>
          </div>
          <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Rewards & Player Holdings</h1>
          <p className="text-foreground-muted text-sm">
            Track your player holdings and accumulated rewards
          </p>
        </div>

        <RewardsSummary 
          userRewards={userRewards}
          isLoading={rewardsLoading}
          address={address}
        />

        {/* Packs Section */}
        <PacksSection walletAddress={address} />

        {/* Player Holdings Section */}
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Player Holdings</h2>
          </div>
          
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search players or teams..."
              className="max-w-md"
            />
          </div>

          <HoldingsTable holdings={filteredHoldings} />
        </div>
      </div>
    </div>
  );
}
