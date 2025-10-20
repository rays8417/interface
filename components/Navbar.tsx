"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useState, useEffect } from "react";
import HowToPlayModal from "./HowToPlayModal";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useLiquidityPairs } from "@/hooks/useLiquidityPairs";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, user, login, logout } = usePrivy();
  const { ready, wallets } = useSolanaWallets();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { availableTokens } = useLiquidityPairs();
  const { balances } = useTokenBalances(walletAddress || undefined, availableTokens);
  const isLanding = pathname === "/";

  useEffect(() => {
    if (!ready) return;
    if (wallets.length === 0) {
      return;
    }
    setWalletAddress(wallets[0].address);
  }, [ready, wallets]);

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

  // Don't render navbar on landing page
  if (isLanding) {
    return null;
  }

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive ? "text-foreground" : "text-foreground-muted hover:text-foreground"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        {label}
        {isActive && (
          <span className="pointer-events-none absolute -bottom-[6px] left-2 right-2 h-[2px] rounded bg-gradient-to-r from-primary via-accent to-primary" />
        )}
      </Link>
    );
  };

  return (
    <>
    <header className={`sticky top-0 z-40 ${isLanding ? "" : "border-b border-border"} bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60`}>
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image 
            src="/tenjakulogo-white-nobg.png" 
            alt="Tenjaku Logo" 
            width={52} 
            height={52}
            className="object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground group-hover:text-foreground">
            Tenjaku
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Desktop Navigation (hidden on landing) */}
          {!isLanding && (
            <nav className="hidden md:flex items-center gap-1.5">
              <NavLink href="/players" label="Players" />
              <NavLink href="/swaps" label="Swaps" />
              <NavLink href="/tournaments" label="Tournaments" />
              <NavLink href="/holdings" label="Holdings" />
              <NavLink href="/leaderboard" label="Leaderboard" />
              <button
                onClick={() => setHowToPlayOpen(true)}
                className="px-3 py-2 text-sm font-medium rounded-md text-foreground-muted hover:text-foreground transition-colors"
              >
                How to Play
              </button>
            </nav>
          )}

          {/* Right Section */}
          <div className="hidden sm:flex items-center gap-3">
            {isLanding ? (
              authenticated && walletAddress ? (
                <button
                  onClick={() => router.push("/swaps")}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Enter App
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={!ready}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!ready ? "Loading..." : "Connect Wallet"}
                </button>
              )
            ) : authenticated && walletAddress ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted text-foreground text-sm rounded-md border border-border">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    B
                  </div>
                  <span className="font-medium">{balances.boson?.toFixed(2) || '0.00'}</span>
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
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-2 text-sm rounded-md border border-border text-foreground hover:bg-surface-elevated transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={!ready}
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!ready ? "Loading..." : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-elevated text-foreground hover:bg-muted"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
          {!isLanding && (
            <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
              <NavLink href="/tournaments" label="Tournaments" />
              <NavLink href="/players" label="Players" />
              <NavLink href="/holdings" label="Holdings" />
              <NavLink href="/swaps" label="Swaps" />
              <NavLink href="/leaderboard" label="Leaderboard" />
              <button
                onClick={() => {
                  setHowToPlayOpen(true);
                  setMobileOpen(false);
                }}
                className="text-left px-3 py-2 text-sm font-medium rounded-md text-foreground-muted hover:text-foreground transition-colors"
              >
                How to Play
              </button>
            </nav>
          )}
          <div className="mx-auto max-w-7xl px-4 pb-4">
            {isLanding ? (
              authenticated && walletAddress ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/swaps");
                  }}
                  className="mt-2 w-full inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Enter App
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleConnect();
                    setMobileOpen(false);
                  }}
                  disabled={!ready}
                  className="mt-2 w-full inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!ready ? "Loading..." : "Connect Wallet"}
                </button>
              )
            ) : authenticated && walletAddress ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-center gap-2 px-2.5 py-1.5 bg-muted text-foreground text-sm rounded-md border border-border">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    B
                  </div>
                  <span className="font-medium">{balances.boson?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={handleCopyAddress}
                    className="w-full px-2.5 py-1.5 bg-muted text-foreground text-sm font-mono rounded-md border border-border text-center hover:bg-surface-elevated transition-colors cursor-pointer"
                    title="Click to copy address"
                  >
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}
                  </button>
                  {copied && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap z-50">
                      Address copied!
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 text-sm rounded-md border border-border text-foreground hover:bg-surface-elevated"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleDisconnect();
                      setMobileOpen(false);
                    }}
                    className="px-3 py-2 text-sm rounded-md border border-border text-foreground hover:bg-surface-elevated"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleConnect();
                  setMobileOpen(false);
                }}
                disabled={!ready}
                className="mt-2 w-full inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!ready ? "Loading..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
    <HowToPlayModal 
      isOpen={howToPlayOpen} 
      onClose={() => setHowToPlayOpen(false)} 
    />
    </>
  );
}
