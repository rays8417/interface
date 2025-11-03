"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBoson: () => void;
  onSelectXP: () => void;
  packType: string;
  bosonCost: number;
  xpCost: number;
  userXP: number;
  bosonBalance: number;
  loading?: boolean;
}

export default function PaymentSelectionModal({
  isOpen,
  onClose,
  onSelectBoson,
  onSelectXP,
  packType,
  bosonCost,
  xpCost,
  userXP,
  bosonBalance,
  loading = false,
}: PaymentSelectionModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasEnoughXP = userXP >= xpCost;
  const hasEnoughBoson = bosonBalance >= bosonCost;

  const modalContent = isOpen && mounted ? createPortal(
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-surface border border-border rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full"
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

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Choose Payment Method
          </h2>
          <p className="text-sm text-foreground-muted">
            Select how you want to purchase the {packType} pack
          </p>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          {/* Boson Option */}
          <button
            onClick={onSelectBoson}
            disabled={!hasEnoughBoson || loading}
            className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left ${
              hasEnoughBoson && !loading
                ? "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500 cursor-pointer"
                : "border-border bg-surface-elevated opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  B
                </div>
                <div>
                  <div className="font-semibold text-foreground">Pay with BOSON</div>
                  
                </div>
              </div>
              {hasEnoughBoson && (
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">Cost:</span>
              <span className="font-semibold text-foreground">{bosonCost} BOSON</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-foreground-muted">Your balance:</span>
              <span className={`font-semibold ${hasEnoughBoson ? "text-green-500" : "text-red-500"}`}>
                {bosonBalance.toFixed(2)} BOSON
              </span>
            </div>
            {!hasEnoughBoson && (
              <div className="mt-2 text-xs text-red-400">
                Insufficient BOSON balance
              </div>
            )}
          </button>

          {/* XP Option */}
          <button
            onClick={onSelectXP}
            disabled={!hasEnoughXP || loading}
            className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left ${
              hasEnoughXP && !loading
                ? "border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500 cursor-pointer"
                : "border-border bg-surface-elevated opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/30">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Pay with XP</div>
                  
                </div>
              </div>
              {hasEnoughXP && (
                <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">Cost:</span>
              <span className="font-semibold text-foreground">{xpCost} XP</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-foreground-muted">Your XP:</span>
              <span className={`font-semibold ${hasEnoughXP ? "text-green-500" : "text-red-500"}`}>
                {userXP.toLocaleString()} XP
              </span>
            </div>
            {!hasEnoughXP && (
              <div className="mt-2 text-xs text-red-400">
                Insufficient XP
              </div>
            )}
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="w-full mt-6 py-3 px-4 bg-surface-elevated hover:bg-surface border border-border hover:border-border-strong text-foreground font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return <>{modalContent}</>;
}
