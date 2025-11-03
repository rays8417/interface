import { useState } from "react";
import EmptyState from "../ui/EmptyState";
import ShareModal from "./ShareModal";
import { Share2 } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  rank: number;
  walletAddress: string;
  rewards: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  totalAddresses?: number;
  className?: string;
  userWalletAddress?: string;
}

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

export default function LeaderboardTable({ entries, totalAddresses, className = "", userWalletAddress }: LeaderboardTableProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    rank: number;
    rewards: number;
    walletAddress: string;
  }>({
    isOpen: false,
    rank: 0,
    rewards: 0,
    walletAddress: "",
  });

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleShareClick = (entry: LeaderboardEntry) => {
    setShareModalData({
      isOpen: true,
      rank: entry.rank,
      rewards: entry.rewards,
      walletAddress: entry.walletAddress,
    });
  };

  const closeShareModal = () => {
    setShareModalData({
      isOpen: false,
      rank: 0,
      rewards: 0,
      walletAddress: "",
    });
  };

  const isUserEntry = (address: string) => {
    return userWalletAddress && address.toLowerCase() === userWalletAddress.toLowerCase();
  };
  return (
    <div className={className}>
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        
        {/* Table Header */}
        <div className="bg-surface border-b border-border">
          <div className="grid grid-cols-[100px_1fr_200px_80px] px-6 py-4">
            <div className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
              Rank
            </div>
            <div className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
              Wallet Address
            </div>
            <div className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
              Rewards
            </div>
            <div className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
              Share
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div
                key={entry.id}
                className={`grid grid-cols-[100px_1fr_200px_80px] px-6 py-4 hover:bg-surface-elevated/50 transition-colors ${
                  isUserEntry(entry.walletAddress) ? "bg-primary/5 border-l-4 border-l-primary" : ""
                }`}
              >
                {/* Rank */}
                <div className="flex items-center">
                  <span className="text-lg font-bold text-foreground">
                    #{entry.rank}
                  </span>
                </div>

                {/* Wallet Address */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyAddress(entry.walletAddress)}
                    className="font-mono text-sm text-foreground bg-muted px-3 py-1 rounded-md border border-border hover:bg-surface-elevated hover:border-primary transition-all cursor-pointer"
                    title="Click to copy full address"
                  >
                    {formatWalletAddress(entry.walletAddress)}
                  </button>
                  {isUserEntry(entry.walletAddress) && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                      You
                    </span>
                  )}
                  {copiedAddress === entry.walletAddress && (
                    <div className="flex items-center gap-1 text-xs text-white font-medium animate-in fade-in slide-in-from-left-2 duration-200">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied</span>
                    </div>
                  )}
                </div>

                {/* Rewards */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    B
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {formatRewards(entry.rewards)}
                  </span>
                </div>

                {/* Share Button */}
                <div className="flex items-center justify-center">
                  {isUserEntry(entry.walletAddress) && (
                    <button
                      onClick={() => handleShareClick(entry)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all shadow-sm shadow-primary/20 hover:shadow-primary/30 font-medium text-sm"
                      title="Share your achievement"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  )}
                </div>
              </div>
            ))
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
              title="No entries found"
              description="Try adjusting your search"
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalData.isOpen}
        onClose={closeShareModal}
        rank={shareModalData.rank}
        rewards={shareModalData.rewards}
        walletAddress={shareModalData.walletAddress}
      />
    </div>
  );
}
