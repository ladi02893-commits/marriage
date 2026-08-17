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
  title: "Compatible Matrimonials — AI-Powered Matrimonial Platform",
  description:
    "Where Compatibility Meets Commitment. A high-trust, verified matrimonial platform connecting educated professionals and families worldwide.",
  keywords: [
    "Compatible Matrimonials",
    "Marriage Bureau",
    "Matchmaking",
    "Verified Matrimonial Profiles",
    "Compatibility Matching",
    "Matrimony Web App",
  ],
  authors: [{ name: "Compatible Matrimonials" }],
  openGraph: {
    title: "Compatible Matrimonials — AI-Powered Verified Matchmaking",
    description: "Connect with verified, cultured professionals and families seeking lifelong marriage.",
    type: "website",
    siteName: "Compatible Matrimonials",
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
