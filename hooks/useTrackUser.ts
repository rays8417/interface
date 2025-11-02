import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface TrackUserParams {
  address: string;
  twitterUsername: string;
}

export function useTrackUser() {
  const trackUser = useCallback(async (params: TrackUserParams) => {
    console.log('[TRACK USER] 🚀 Starting user tracking with params:', params);
    
    try {
      // Get referral code from localStorage if it exists
      const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;
      console.log('[TRACK USER] 🔍 Referral code from localStorage:', referralCode);

      const payload = {
        address: params.address,
        twitterUsername: params.twitterUsername,
        ...(referralCode && { referralCode }),
      };

      console.log('[TRACK USER] 📤 Sending payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/users/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[TRACK USER] 📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TRACK USER] ❌ API error response:', errorText);
        throw new Error('Failed to track user');
      }

      const data = await response.json();
      console.log('[TRACK USER] ✅ API response:', data);

      // Clear referral code after successful tracking
      if (referralCode && typeof window !== 'undefined') {
        localStorage.removeItem('referralCode');
        console.log('[TRACK USER] ✅ Cleared referral code from localStorage');
      }

      return data;
    } catch (error) {
      console.error('[TRACK USER] ❌ Error tracking user:', error);
      console.error('[TRACK USER] Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      // Don't show error toast to user - this is a non-critical operation
      return null;
    }
  }, []);

  return { trackUser };
}
