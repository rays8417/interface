"use client";

import { useWallet } from "@/hooks/useWallet";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import Image from "next/image";
import SearchBar from "@/components/ui/SearchBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import RewardsSummary from "@/components/my-teams/RewardsSummary";
import HoldingsTable from "@/components/my-teams/HoldingsTable";
import PacksSection from "@/components/packs/PacksSection";
import { useUserRewards } from "@/hooks/useUserRewards";
import { usePlayerHoldings } from "@/hooks/usePlayerHoldings";
import { useUserPacks } from "@/hooks/useUserPacks";

type TabType = 'overview' | 'packs' | 'portfolio';

export default function MyTeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copySuccess, setCopySuccess] = useState(false);
  const { account } = useWallet();
  const { user } = usePrivy();
  const address = account?.address;

  // Get Twitter info including profile picture
  const getTwitterInfo = () => {
    const userAny = user as any;
    
    // Try to find twitter account with different possible type names
    const twitterAccount = userAny?.linkedAccounts?.find((account: any) => 
      account.type === 'twitter_oauth' || 
      account.type === 'twitter' ||
      account.type === 'x'
    );
    
    return {
      username: twitterAccount?.username || null,
      profilePictureUrl: twitterAccount?.profile_picture_url || twitterAccount?.profilePictureUrl || twitterAccount?.picture || null,
    };
  };

  const { username: twitterUsername, profilePictureUrl } = getTwitterInfo();
  
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const { userRewards, loading: rewardsLoading } = useUserRewards(address);
  const { holdings, loading, error } = usePlayerHoldings(address);
  const { userPacks, loading: packsLoading, error: packsError, refresh: refreshPacks } = useUserPacks(address);

  const filteredHoldings = holdings
    .filter(
      (holding) =>
        holding.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        holding.team.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.shares - a.shares); // Sort by shares in descending order

  const unopenedPacksCount = userPacks?.filter(pack => !pack.isOpened).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-8">
        {/* User Profile Section */}
        <div className="mb-8 bg-card border border-border rounded-xl p-6">
          {!address ? (
            // Skeleton for user profile
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted animate-pulse flex-shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {profilePictureUrl ? (
                <Image
                  src={profilePictureUrl}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {twitterUsername ? twitterUsername.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                {/* Username */}
                {twitterUsername && (
                  <h2 className="text-lg font-bold text-foreground mb-1">
                    {twitterUsername}
                  </h2>
                )}
                
                {/* Address with Copy Button */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground-muted font-mono">
                    {formatAddress(address)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground bg-surface-elevated hover:bg-muted border border-border rounded-lg transition-all duration-200"
                  >
                    {copySuccess ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground-muted hover:text-foreground'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('packs')}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'packs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Packs</span>
                  {unopenedPacksCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unopenedPacksCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'portfolio'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground-muted hover:text-foreground'
                }`}
              >
                Portfolio
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <RewardsSummary 
              userRewards={userRewards}
              isLoading={rewardsLoading}
              address={address}
            />
          </div>
        )}

        {activeTab === 'packs' && (
          <div>
            <PacksSection 
              userPacks={userPacks} 
              loading={packsLoading} 
              error={packsError}
              onPacksChange={refreshPacks} 
            />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
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

            {error ? (
              <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
            ) : loading ? (
              <LoadingSpinner size="md" text="Loading player holdings..." />
            ) : (
              <HoldingsTable holdings={filteredHoldings} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
