import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: "Aptos Biodiversity & Carbon Marketplace",
  description: "Contribute to the Aptos Biodiversity & Carbon Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-gray-900 text-white">
        <ReactQueryProvider>
          <WalletProvider>
            <div className="container mx-auto px-4">
              {children}
              <Toaster />
            </div>
          </WalletProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}