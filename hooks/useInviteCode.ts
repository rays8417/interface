import { useState, useEffect } from 'react';

export function useInviteCode(username?: string | null) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (username) {
      setInviteCode(username);
    }
  }, [username]);

  const getInviteUrl = (): string => {
    if (!inviteCode) return '';
    return `tenjaku.fun/invite/${inviteCode}`;
  };

  return {
    inviteCode,
    isLoading,
    getInviteUrl,
  };
}
