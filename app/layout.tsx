import { Outfit } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { Navbar } from "@/components/Navbar";

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <SolanaWalletProvider>
      <Navbar />
      <body
        className={`${outfit.variable} font-sans antialiased bg-black text-white min-h-screen`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
      </SolanaWalletProvider>
    </html>
  );
}
