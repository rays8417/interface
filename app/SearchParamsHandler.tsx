"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SearchParamsHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get('ref');
   // console.log('[LANDING PAGE] Checking URL params for ref code:', referralCode);
    if (referralCode) {
      console.log('[LANDING PAGE] ✅ Found referral code:', referralCode);
      // Store referral code in localStorage for later use during signup
      localStorage.setItem('referralCode', referralCode);
      //console.log('[LANDING PAGE] ✅ Stored referral code in localStorage');
    } else {
      //console.log('[LANDING PAGE] ℹ️ No referral code found in URL');
    }
  }, [searchParams]);

  return null;
}
