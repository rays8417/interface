"use client";

import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useState, useEffect } from "react";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useLiquidityPairs } from "@/hooks/useLiquidityPairs";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TopBar() {
  const pathname = usePathname();
  const { authenticated, user, login, logout } = usePrivy();
  const { ready, wallets } = useSolanaWallets();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const { availableTokens } = useLiquidityPairs();
  const { balances, loading: balancesLoading } = useTokenBalances(walletAddress || undefined, availableTokens);
  const isLanding = pathname === "/";

  useEffect(() => {
    if (!ready) return;
    if (wallets.length === 0) {
      return;
    }
    setWalletAddress(wallets[0].address);
  }, [ready, wallets]);

  // Check if user has an embedded wallet
  const userAny = user as any;
  const hasEmbeddedWallet = 
    userAny?.wallet?.walletClientType === 'privy' && 
    userAny?.wallet?.chainType === 'solana';

  // Close dropdown on Escape key or click outside
  useEffect(() => {
    if (!showLogout) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLogout(false);
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setShowLogout(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showLogout]);

  const handleConnect = async () => {
    try {
      login();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      setWalletAddress(null);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const getUserEmail = () => {
    if (!user?.email?.address) return null;
    const email = user.email.address;
    if (email.length > 20) {
      const [localPart, domain] = email.split('@');
      if (localPart.length > 10) {
        return `${localPart.slice(0, 8)}...@${domain}`;
      }
    }
    return email;
  };

  // Don't render top bar on landing page
  if (isLanding) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
        <div className="h-16 flex items-center justify-between px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1 flex justify-end">
            {authenticated && walletAddress ? (
              <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted text-foreground text-sm rounded-md border border-border">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  B
                </div>
                <span className="font-medium">
                  {balancesLoading ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : (
                    balances.boson?.toFixed(2) || '0.00'
                  )}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={handleCopyAddress}
                  className="px-2.5 py-1.5 bg-muted text-foreground text-sm font-mono rounded-md border border-border hover:bg-surface-elevated transition-colors cursor-pointer"
                  title="Click to copy address"
                >
                  {walletAddress}
                </button>
                {copied && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap z-50">
                    Address copied!
                  </div>
                )}
              </div>
              {authenticated && walletAddress ? (
                <a 
                  href={`https://boson-faucet.vercel.app/?address=${walletAddress}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-muted text-primary hover:bg-surface-elevated rounded-lg transition-colors border border-border hover:border-primary/50"
                >
                  Get Testnet Boson
                </a>
              ) : (
                <div /> 
              )}
              </div>
            ) : !ready || (authenticated && !walletAddress) ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-5 py-1.5 bg-muted text-foreground text-sm rounded-md border border-border">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    B
                  </div>
                  <span className="font-medium">
                    <div className="h-4 w-8 bg-gray-300 rounded animate-pulse"></div>
                  </span>
                </div>
                <div className="relative">
                  <div className="px-1 py-2 bg-muted text-foreground text-sm font-mono rounded-md border border-border">
                    <div className="h-4 w-[7.5rem] bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 px-1 py-2 text-sm rounded-md border border-border bg-muted">
                    <div className="h-4 w-[10rem] bg-gray-300 rounded animate-pulse"></div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

