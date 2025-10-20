// src/providers/PrivyProviderWrapper.tsx
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';


export default function PrivyProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["email"],
        embeddedWallets: {
            solana: {
              createOnLogin: "users-without-wallets"
            }
          },
        solana: {
            rpcs: {
              "solana:devnet": {
                rpc: createSolanaRpc('https://api.devnet.solana.com'),
                rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com')
              },
            },
        },
        appearance: {
          theme: "dark",
          accentColor: "#3b82f6",
          logo: "/tenjakulogo-white-nobg.png",
          walletChainType: "solana-only", // or "ethereum-and-solana" if you also support EVM
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
