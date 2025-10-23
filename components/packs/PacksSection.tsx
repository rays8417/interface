"use client";

import { useState } from "react";
import PackCard from "./PackCard";
import PackDetailsModal from "./PackDetailsModal";
import HoldingsOpenPacksModal from "./HoldingsOpenPacksModal";
import { useUserPacks } from "@/hooks/useUserPacks";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import EmptyState from "@/components/ui/EmptyState";

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

interface PacksSectionProps {
  userPacks?: UserPack[];
  loading?: boolean;
  error?: string | null;
  walletAddress?: string;
  onPacksChange?: () => void;
}

export default function PacksSection({ 
  userPacks: propUserPacks, 
  loading: propLoading, 
  error: propError,
  walletAddress, 
  onPacksChange 
}: PacksSectionProps) {
  const [selectedPack, setSelectedPack] = useState<UserPack | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'unopened' | 'opened'>('unopened');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use props if provided, otherwise fetch data (for backwards compatibility)
  const hookData = useUserPacks(propUserPacks === undefined ? walletAddress : undefined);
  const userPacks = propUserPacks !== undefined ? propUserPacks : hookData.userPacks;
  const loading = propLoading !== undefined ? propLoading : hookData.loading;
  const error = propError !== undefined ? propError : hookData.error;
  const hasLoaded = propUserPacks !== undefined ? true : hookData.hasLoaded;
  const openPack = hookData.openPack;
  const refresh = hookData.refresh;

  const handleSeePack = (pack: UserPack) => {
    setSelectedPack(pack);
    setShowPreviewModal(true);
  };

  const handleViewDetails = (pack: UserPack) => {
    setSelectedPack(pack);
    setShowDetailsModal(true);
  };

  const handleClosePreview = async () => {
    setShowPreviewModal(false);
    setSelectedPack(null);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedPack(null);
  };

  const handlePackOpened = async () => {
    // Show loading state
    setIsRefreshing(true);
    
    // Refresh local packs data
    refresh();
    
    // Notify parent component (holdings page) to refresh
    onPacksChange?.();
    
    // Give a small delay to ensure data is fetched
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Hide loading state
    setIsRefreshing(false);
  };

  // Filter packs based on active tab
  const getFilteredPacks = () => {
    if (!userPacks) return [];
    
    switch (activeTab) {
      case 'unopened':
        return userPacks.filter(pack => !pack.isOpened);
      case 'opened':
        return userPacks.filter(pack => pack.isOpened);
      default:
        return [];
    }
  };

  const filteredPacks = getFilteredPacks();
  const openedPacks = userPacks?.filter(pack => pack.isOpened) || [];
  const unopenedPacks = userPacks?.filter(pack => !pack.isOpened) || [];

  // Show loading when explicitly loading or when we have a wallet but haven't loaded yet
  // If props are provided, trust the loading state from parent
  const isLoading = propUserPacks !== undefined ? loading : (loading || (!hasLoaded && walletAddress));

  if (isLoading || isRefreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Packs</h2>
        </div>
        <LoadingSpinner size="md" text={isRefreshing ? "Refreshing your packs..." : "Loading your packs..."} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Packs</h2>
        </div>
        <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Only show empty state if we've loaded and confirmed there are no packs
  // If props are provided, we can show empty state immediately (parent has loaded)
  const canShowEmptyState = propUserPacks !== undefined ? !loading : hasLoaded;
  if (canShowEmptyState && (!userPacks || userPacks.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Packs</h2>
        </div>
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
          title="No packs yet"
          description="Visit the Players page to buy your first pack!"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Packs</h2>
        <div className="text-sm text-foreground-muted">
          {userPacks.length} pack{userPacks.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
        <button
          onClick={() => setActiveTab('unopened')}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
            activeTab === 'unopened'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-foreground-muted hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          Unopened ({unopenedPacks.length})
        </button>
        <button
          onClick={() => setActiveTab('opened')}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
            activeTab === 'opened'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-foreground-muted hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          Opened ({openedPacks.length})
        </button>
      </div>

      {/* Pack Grid */}
      {filteredPacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPacks.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  onSeePack={pack.isOpened ? undefined : handleSeePack}
                  onViewDetails={pack.isOpened ? handleViewDetails : undefined}
                />
              ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <p className="text-foreground-muted text-sm">
              {activeTab === 'unopened' 
                ? "You don't have any unopened packs"
                : "You haven't opened any packs yet"}
            </p>
          </div>
        </div>
      )}

      {/* Pack Preview Modal */}
      <HoldingsOpenPacksModal
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
        pack={selectedPack}
        onPackOpened={handlePackOpened}
      />

      {/* Pack Details Modal */}
      <PackDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        pack={selectedPack}
      />
    </div>
  );
}
