import { Outfit } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

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
    <html lang="en">
      <SolanaWalletProvider>
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
      </SolanaWalletProvider>
    </html>
  );
}
