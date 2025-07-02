import { Inter as FontSans } from "next/font/google";
import type React from "react";

import { cn } from "@/lib/utils";
import { Providers } from "@/providers/providers";
import { Suspense } from "react";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import type { Viewport } from "next";


export const metadata = {
  metadataBase: new URL("https://github.com/BankkRoll/memoryloler"),
  title: "MemoryLoler | Social Media Account History Lookup",
  description:
    "Look up historical information about social media accounts. Find past usernames, account changes, and identity connections across platforms.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        <Providers>
          <Suspense>
            <div className="relative flex min-h-screen flex-col">
              <main className="flex flex-1 flex-col">{children}</main>
            </div>
            <Toaster />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
