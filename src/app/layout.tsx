import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { WhatsAppFloatingWidget } from "@/components/ui/whatsapp-floating-widget";
import { NavigationProgressBar } from "@/components/ui/navigation-progress-bar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "VIP Royal Matchmaking — Premium Connection-Based Matrimonial Platform",
  description:
    "Where Nobility Meets Lifelong Matrimony. A high-trust, connection-based matrimonial and relationship platform connecting educated Pakistani professionals and families worldwide.",
  keywords: [
    "VIP Royal Matchmaking",
    "Pakistani Marriage Bureau",
    "VIP Rishta Matchmaking",
    "Verified Matrimonial Profiles",
    "Family Consultant Matrimony",
    "Royal Pakistani Matrimony",
  ],
  authors: [{ name: "VIP Royal Matchmaking" }],
  openGraph: {
    title: "VIP Royal Matchmaking — Premium Pakistani Matrimonial Platform",
    description: "Connect with verified, cultured professionals and respected families seeking lifelong marriage.",
    type: "website",
    siteName: "VIP Royal Matchmaking",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className="bg-background text-foreground font-sans min-h-full flex flex-col selection:bg-brand-500 selection:text-white">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <AuthProvider>
          {children}
          <WhatsAppFloatingWidget />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
