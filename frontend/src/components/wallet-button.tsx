"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  return (
    <WalletMultiButton
      className="!bg-gradient-to-r !from-[#ff6b35] !to-[#ff8555] hover:!from-[#ff8555] hover:!to-[#ff6b35] !rounded-lg !px-6 !py-2 !font-semibold !transition-all !duration-300 !border-0"
    />
  );
}
