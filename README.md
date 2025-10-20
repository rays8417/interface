This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Privy Configuration
# Get your Privy App ID from https://dashboard.privy.io/
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Privy Setup

1. Sign up for a Privy account at [https://dashboard.privy.io/](https://dashboard.privy.io/)
2. Create a new app in the Privy dashboard
3. Configure your app to support **Solana** blockchain
4. Enable **Email** login method in the authentication settings
5. Copy your App ID and add it to `.env.local` as `NEXT_PUBLIC_PRIVY_APP_ID`

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn install && yarn dev
# or
pnpm install && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- 🔐 **Privy Authentication**: Email-based login with embedded Solana wallets
- ⚡ **Solana Integration**: Seamless Solana blockchain integration
- 🎮 **Fantasy Gaming**: Cricket fantasy gaming platform
- 💱 **Token Swaps**: Built-in token swap functionality
- 📊 **Player Holdings**: Track and manage player token holdings
- 🏆 **Tournaments**: Participate in cricket tournaments and win rewards

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
