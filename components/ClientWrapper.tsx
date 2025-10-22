"use client";

import { useWallet } from "@/hooks/useWallet";
import WelcomeModal from "@/components/WelcomeModal";
import { useEffect } from "react";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const { showWelcomeModal, setShowWelcomeModal } = useWallet();

  // Debug: Log when showWelcomeModal changes
  useEffect(() => {
    console.log("[CLIENT WRAPPER] showWelcomeModal state:", showWelcomeModal);
  }, [showWelcomeModal]);

  return (
    <>
      {children}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => {
          console.log("[CLIENT WRAPPER] Closing welcome modal");
          setShowWelcomeModal(false);
        }} 
      />
    </>
  );
}
