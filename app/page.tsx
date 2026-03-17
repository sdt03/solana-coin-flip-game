"use client";
import { CoinFlip } from "@/components/CoinFlip";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans">
      <CoinFlip />
    </div>
  );
}
