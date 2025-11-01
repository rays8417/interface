"use client";

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  inviteUrl: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  inviteCode,
  inviteUrl,
}: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (modalRef.current && !modalRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
      toast.error('Failed to copy invite link');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-surface-elevated border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 inline-flex items-center justify-center rounded-lg p-1 hover:bg-muted transition-colors"
        >
          <svg
            className="w-6 h-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Share Your Invite
            </h2>
            <p className="text-sm text-foreground-muted">
              Invite your friends to Tenjaku
            </p>
          </div>

          {/* Invite Code Display */}
          <div className="mb-8 p-4 bg-surface rounded-xl border border-border">
            <div className="text-xs text-foreground-muted uppercase tracking-wide mb-2">
              Your Invite Link
            </div>
            <div className="text-lg font-mono font-bold text-primary break-all">
              {inviteUrl}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyInviteLink}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 mb-6 flex items-center justify-center gap-2 ${
              copied
                ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copied ? 'Copied!' : 'Copy Invite Link'}
          </button>

          {/* XP Reward Info */}
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L15.09 8.26H22L17.55 12.5L19.64 18.76L12 14.5L4.36 18.76L6.45 12.5L2 8.26H8.91L12 2Z" />
              </svg>
              <p className="text-sm font-medium text-foreground">
                Earn <span className="text-primary font-bold">15 XP</span> for each successful invite
              </p>
            </div>
            <p className="text-xs text-foreground-muted">
              Your friends will receive a special welcome bonus when they join
            </p>
          </div>

          {/* Close Button at Bottom */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-2 px-4 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
