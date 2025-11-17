"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TestnetInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestnetInfoModal({ isOpen, onClose }: TestnetInfoModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug: Log when props change
  useEffect(() => {
    console.log("[TESTNET MODAL] Props changed - isOpen:", isOpen, "mounted:", mounted);
  }, [isOpen, mounted]);

  const handleClose = () => {
    // Remember that user has seen this modal in this session
    sessionStorage.setItem("testnet-info-seen", "true");
    onClose();
  };

  const modalContent = isOpen && mounted ? createPortal(
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm overflow-y-auto transition-all duration-200"
      style={{ zIndex: 10000 }}
      onClick={handleClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-surface border border-border rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8 relative my-8 transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-foreground-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal content */}
        <div className="space-y-6 text-center">
          {/* Testnet Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-8 w-8 text-warning"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">You're on Testnet!</h2>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Welcome to Tenjaku! We're currently running on <strong className="text-foreground">Solana Devnet</strong> for testing purposes.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-3 text-left">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold text-primary">Everything is FREE to try!</p>
                <ul className="text-sm text-foreground-muted space-y-1.5 list-disc list-inside">
                  <li>All transactions use test tokens</li>
                  <li>No real money is involved</li>
                  <li>Feel free to explore and test features</li>
                  <li>Your testnet tokens have no real value</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Whitelist Info */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5 text-success"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-success">Early User Benefits</p>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Early users will be whitelisted for exclusive rewards and features when we launch on mainnet!
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Got it, let's go!
          </button>
        </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return <>{modalContent}</>;
}

