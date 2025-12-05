import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SolanaWalletProvider } from "@/components/wallet-provider";

export const metadata: Metadata = {
  title: "Skeptic - Social Accountability Protocol",
  description: "Stake USDC, complete tasks, winners split the pot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a]">
        <SolanaWalletProvider>
          {children}
          <Toaster />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
