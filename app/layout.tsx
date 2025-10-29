import type { Metadata } from "next";
import localFont from "next/font/local";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ContentWrapper from "../components/ContentWrapper";
import PrivyProviderWrapper from "../contexts/PrivyProvider";
import { TournamentDataProvider } from "../contexts/TournamentDataContext";
import ClientWrapper from "../components/ClientWrapper";
import { Toaster } from "react-hot-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tenjaku",
  description: "Cricket fantasy",
  icons: {
    icon: '/tenjaku-circular-blackwhite.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased scrollbar-thin`}
      >
        <PrivyProviderWrapper>
          <TournamentDataProvider>
            <SidebarProvider>
              <Sidebar />
              <SidebarInset>
                <TopBar />
                <ContentWrapper>
                  <ClientWrapper>
                    {children}
                    <Analytics />
                  </ClientWrapper>
                </ContentWrapper>
              </SidebarInset>
            </SidebarProvider>
          </TournamentDataProvider>
          <Toaster 
            position="bottom-right"
            containerStyle={{
              bottom: 20,
              right: 20,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(24, 24, 32, 0.95)',
                color: 'rgb(250, 250, 250)',
                border: '1px solid rgba(38, 38, 38, 0.8)',
                borderRadius: '12px',
                padding: '14px 18px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '420px',
              },
              success: {
                duration: 4000,
                style: {
                  background: 'rgba(24, 24, 32, 0.8)',
                  border: '2px solid rgba(34, 197, 94, 1)',
                  color: 'rgb(250, 250, 250)',
                },
                iconTheme: {
                  primary: 'rgb(34, 197, 94)',
                  secondary: 'rgba(24, 24, 32, 0.8)',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: 'rgba(24, 24, 32, 0.8)',
                  border: '2px solid rgba(239, 68, 68, 1)',
                  color: 'rgb(250, 250, 250)',
                },
                iconTheme: {
                  primary: 'rgb(239, 68, 68)',
                  secondary: 'rgba(24, 24, 32, 0.8)',
                },
              },
              loading: {
                style: {
                  background: 'rgba(24, 24, 32, 0.8)',
                  border: '2px solid rgba(96, 165, 250, 1)',
                  color: 'rgb(250, 250, 250)',
                },
                iconTheme: {
                  primary: 'rgb(96, 165, 250)',
                  secondary: 'rgba(24, 24, 32, 0.8)',
                },
              },
            }}
          />
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
