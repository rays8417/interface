import { useCallback, useEffect, useState } from 'react';

type BalanceRefreshCallback = () => void;

class BalanceRefreshManager {
  private callbacks: Set<BalanceRefreshCallback> = new Set();

  subscribe(callback: BalanceRefreshCallback) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  refresh() {
    console.log("🔄 Triggering balance refresh for all subscribers");
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error("Balance refresh callback error:", error);
      }
    });
  }
}

const balanceRefreshManager = new BalanceRefreshManager();

export function useBalanceRefresh() {
  const triggerRefresh = useCallback(() => {
    balanceRefreshManager.refresh();
  }, []);

  return { triggerRefresh };
}

export function useBalanceRefreshSubscription(callback: BalanceRefreshCallback) {
  useEffect(() => {
    return balanceRefreshManager.subscribe(callback);
  }, [callback]);
}