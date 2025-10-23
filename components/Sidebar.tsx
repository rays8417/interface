"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets, useExportWallet } from '@privy-io/react-auth/solana';
import HowToPlayModal from "./HowToPlayModal";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export default function Sidebar() {
  const pathname = usePathname();
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const isLanding = pathname === "/";
  
  const { authenticated, user, logout } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const { exportWallet } = useExportWallet();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [showExportWarning, setShowExportWarning] = useState(false);

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

  const handleDisconnect = async () => {
    try {
      await logout();
      setWalletAddress(null);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

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

  // Don't render sidebar on landing page
  if (isLanding) {
    return null;
  }

  const navItems = [
    {
      href: "/players",
      label: "Players",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: "/swaps",
      label: "Swaps",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      href: "/tournaments",
      label: "Tournaments",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      href: "/holdings",
      label: "Holdings",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const WalletSection = () => {
    if (authenticated && walletAddress) {
      const { username, profilePictureUrl } = getTwitterInfo();
      
      return (
        <div className="p-2">
          <div className="relative" data-dropdown-container>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLogout(!showLogout);
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-md border border-border text-foreground bg-muted hover:bg-surface-elevated transition-colors"
            >
              <span className="truncate">
                {username}
              </span>
              <svg 
                className="w-4 h-4 flex-shrink-0"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            {showLogout && (
              <div 
                className="absolute bottom-full mb-2 left-0 right-0 z-[101] bg-surface-elevated border border-border rounded-lg shadow-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    {profilePictureUrl ? (
                      <Image
                        src={profilePictureUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                        {username ? username[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="font-medium text-foreground truncate">
                      {username}
                    </span>
                  </div>
                </div>
                {hasEmbeddedWallet && (
                  <button
                    onClick={() => {
                      setShowExportWarning(true);
                      setShowLogout(false);
                    }}
                    className="w-full px-4 py-3 text-sm text-left text-foreground hover:bg-surface transition-colors font-medium flex items-center gap-3 border-b border-border"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Export Wallet
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDisconnect();
                    setShowLogout(false);
                  }}
                  className="w-full px-4 py-3 text-sm text-left text-red-500 hover:text-red-600 hover:bg-surface transition-colors font-medium flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      );
    } else if (!ready || (authenticated && !walletAddress)) {
      return (
        <div className="p-2">
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-md border border-border bg-muted">
            <div className="h-4 flex-1 bg-gray-300 rounded animate-pulse"></div>
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <>
      <SidebarRoot collapsible="offcanvas" className="border-r border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
        {/* Logo Header */}
        <SidebarHeader className="h-16 border-b border-border ">
          <Link href="/" className="flex items-center pt-1 px-3 gap-2 group">
            <Image 
              src="/tenjakulogo-white-nobg.png" 
              alt="Tenjaku Logo" 
              width={36} 
              height={36}
              className="object-contain"
            />
            <span className="text-xl font-semibold tracking-tight text-foreground group-hover:text-foreground">
              Tenjaku
            </span>
          </Link>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="px-5 py-4">
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`h-11 px-3 ${
                      isActive 
                        ? "bg-primary/10 text-primary border-l-4 border-primary hover:bg-primary/15 hover:text-primary" 
                        : "text-foreground-muted hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setHowToPlayOpen(true)}
                className="h-11 px-3 text-foreground-muted hover:bg-muted hover:text-foreground"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">How to Play</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        {/* Wallet Section at Bottom */}
        <SidebarFooter className="border-t border-border">
          <WalletSection />
        </SidebarFooter>
      </SidebarRoot>

      <HowToPlayModal 
        isOpen={howToPlayOpen} 
        onClose={() => setHowToPlayOpen(false)} 
      />

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

