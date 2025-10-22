"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug: Log when props change
  useEffect(() => {
    console.log("[WELCOME MODAL] Props changed - isOpen:", isOpen, "mounted:", mounted);
  }, [isOpen, mounted]);

  const modalContent = isOpen && mounted ? createPortal(
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm overflow-y-auto transition-all duration-200"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-surface border border-border rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8 relative my-8 transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
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
            {/* Welcome Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-8 w-8 text-green-500"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            {/* Welcome Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Welcome to Tenjaku!</h2>
              <p className="text-foreground-muted text-sm">
                You've been gifted a BASE player pack worth 20 Boson!
              </p>
            </div>

            {/* Gift Details */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5 text-primary"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-semibold text-primary">BASE Player Pack</span>
              </div>
              <p className="text-sm text-foreground-muted">
                Worth 20 Boson tokens
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/holdings"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Claim from Holdings
              </Link>
              <button
                onClick={onClose}
                className="w-full inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Additional Info */}
            <p className="text-xs text-foreground-muted">
              Your gift pack is waiting for you in the Holdings page. Don't miss out!
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return <>{modalContent}</>;
}
