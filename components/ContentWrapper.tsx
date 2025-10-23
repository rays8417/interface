"use client";

import { usePathname } from "next/navigation";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className={`min-h-screen ${isLanding ? '' : 'md:ml-64'}`}>
      {children}
    </div>
  );
}

