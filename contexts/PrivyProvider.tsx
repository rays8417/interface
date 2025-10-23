"use client";

import React, { ReactNode} from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';


export default function PrivyProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {

  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
  }
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethods: ["twitter"],
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
          walletChainType: "solana-only",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
