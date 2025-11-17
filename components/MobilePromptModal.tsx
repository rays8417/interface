"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobilePromptModal() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isMobile === true) {
      // Check if user has dismissed this prompt before
      const dismissed = localStorage.getItem("mobile-prompt-dismissed");
      if (!dismissed) {
        setIsOpen(true);
      }
    } else if (isMobile === false) {
      setIsOpen(false);
    }
  }, [mounted, isMobile]);

  const handleClose = () => {
    setIsOpen(false);
    // Remember dismissal for this session only (or use localStorage for persistent dismissal)
    localStorage.setItem("mobile-prompt-dismissed", "true");
  };

  const handleContinue = () => {
    setIsOpen(false);
    // Don't set dismissed, so it can show again if they refresh
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-surface border border-border rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8 relative transition-all duration-200"
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
          {/* Desktop Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-8 w-8 text-primary"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Best Experience on Desktop</h2>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Tenjaku is optimized for desktop browsers. For the best experience, please open this website on your computer or tablet.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5 text-primary"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-primary">Desktop Recommended</span>
            </div>
            <p className="text-sm text-foreground-muted">
              Full features and optimal performance available on desktop
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continue Anyway
            </button>
            <button
              onClick={handleClose}
              className="w-full inline-flex items-center justify-center rounded-md border border-border bg-surface-elevated px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

