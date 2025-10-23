"use client";

import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets, useExportWallet } from '@privy-io/react-auth/solana';
import { useState, useEffect } from "react";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useLiquidityPairs } from "@/hooks/useLiquidityPairs";

export default function TopBar() {
  const pathname = usePathname();
  const { authenticated, user, login, logout } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const { exportWallet } = useExportWallet();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showExportWarning, setShowExportWarning] = useState(false);

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
        <div className="h-16 flex items-center justify-end px-6 md:ml-64">
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
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </button>
                {copied && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap z-50">
                    Address copied!
                  </div>
                )}
              </div>
              <div className="relative" data-dropdown-container>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogout(!showLogout);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-border text-foreground bg-muted hover:bg-surface-elevated transition-colors"
                >
                  <span>{getUserEmail() || walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showLogout ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLogout && (
                  <div 
                    className="absolute top-full mt-2 right-0 z-[101] min-w-full bg-surface-elevated border border-border rounded-lg shadow-xl overflow-hidden"
                  >
                    {hasEmbeddedWallet && (
                      <button
                        onClick={() => {
                          setShowExportWarning(true);
                          setShowLogout(false);
                        }}
                        className="w-full px-4 py-3 text-sm text-left text-foreground hover:bg-surface transition-colors font-medium border-b border-border"
                      >
                        Export Wallet
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleDisconnect();
                        setShowLogout(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-left text-error hover:bg-surface transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
      </header>

      {/* Export Wallet Warning Modal */}
      {showExportWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExportWarning(false)}
          />
          <div className="relative bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
            <button
              onClick={() => setShowExportWarning(false)}
              className="absolute top-4 right-4 text-foreground-muted hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-foreground">Export Wallet</h2>

            <p className="text-foreground-muted text-sm">
              Export your wallet&apos;s private key to use with other Solana wallets like Phantom or Solflare.
            </p>

            <div className="border-2 border-error rounded-lg p-4 space-y-2 bg-surface/30">
              <h3 className="text-error font-semibold text-sm">Security Warning:</h3>
              <p className="text-error text-sm">
                Never share your private key with anyone. Store it securely and only use it in trusted wallets.
              </p>
            </div>

            <button
              onClick={async () => {
                if (walletAddress) {
                  await exportWallet({ address: walletAddress });
                }
                setShowExportWarning(false);
              }}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg transition-colors"
            >
              Export Private Key
            </button>
          </div>
        </div>
      )}
    </>
  );
}

