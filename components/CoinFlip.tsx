"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "./ui/button";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Input } from "./ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useUser } from "@/hooks/useUser.hook";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useRecentGames } from "@/hooks/useTransaction.hook";
import { SkeletonLoaderLeaderboard } from "./SkeletonLoaderLeaderboard";

const platformWallet = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID!);

interface Game {
  id: number;
  user: {
    walletPublicKey: string;
  }
  transactions: {
    transactionType: string;
  }
  betAmount: number;
  choice: string;
  result: string;
}

export function CoinFlip(){
  const { data: games, isLoading: isLoadingGames } = useRecentGames();

  const truncateKey = (key: string) =>
    key.length > 10 ? `${key.slice(0, 4)}...${key.slice(-4)}` : key;

  const [choice, setChoice] = useState<string>("heads");
  const [amount, setAmount] = useState<number>(0.01);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { publicKey, sendTransaction} = useWallet();
  const { data: user } = useUser(publicKey?.toString() ?? "");
  const step = amount >= 1 ? 1 : amount >= 0.1 ? 0.1 : 0.01;
  const decimals = step === 1 ? 0 : step === 0.1 ? 1 : 3;
  const roundToStep = (value: number) => +value.toFixed(decimals);

  const handleBet = async (amount: number) => {
    setIsLoading(true);
    if (!publicKey) return;
    console.log("RPC: ", process.env.NEXT_PUBLIC_SOLANA_RPC_URL);
    console.log("WS: ", process.env.NEXT_PUBLIC_SOLANA_WS_URL);

    const betAmount = Number(amount) * LAMPORTS_PER_SOL;
    console.log(betAmount);
    const instruction = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: platformWallet,
      lamports: betAmount,
    });
    const tx = new Transaction().add(instruction);
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, {
      commitment: "confirmed",
      wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS_URL!,
    });
    const signature = await sendTransaction(tx, connection);
    console.log(signature);

    let txn = null;

    while (!txn) {
      txn = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      await new Promise((r) => setTimeout(r, 1200));
    }

    const response = await axios.post("/api/game", {
      txSignature: signature.toString(),
      choice,
    });

    if (response.data.message === "Game result is win") {
      toast.success("Game result is win, deposited 2x the amount");
    } else {
      toast.error("Game result is loss, deducted the amount");
    }
    if(response.status !== 200) {
      toast.error("Something went wrong");
      setIsLoading(false);
    }

    setIsLoading(false);
  }

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center text-white">
        <p>Please connect your wallet to continue</p>
        <WalletMultiButton />
      </div>
    )
  }

  const selectedBtn =
    "border-amber-300 bg-amber-400 text-black hover:bg-amber-300";
  const unselectedBtn =
    "border-white/20 bg-white/5 text-white hover:bg-white/10";

  return (
    <div className="w-full px-6 pt-12 pb-20 text-white font-outfit">
      <Card className="mx-auto w-full max-w-[380px] bg-zinc-950/80 text-white ring-1 ring-white/10 backdrop-blur">
        <CardContent className="px-6">
        <h1 className="text-center text-xl font-bold tracking-widest">BET ON</h1>

        <div className="mt-4 grid w-full grid-cols-2 gap-4">
          <Button
            onClick={() => setChoice("heads")}
            className={`h-14 w-full rounded-xl border-2 text-2xl font-bold ${
              choice === "heads" ? selectedBtn : unselectedBtn
            }`}
          >
            Heads
          </Button>
          <Button
            onClick={() => setChoice("tails")}
            className={`h-14 w-full rounded-xl border-2 text-2xl font-bold ${
              choice === "tails" ? selectedBtn : unselectedBtn
            }`}
          >
            Tails
          </Button>
        </div>

        <div className="mt-8 w-full">
          <h2 className="mb-3 text-center text-xl font-bold tracking-widest">
            FOR
          </h2>

          <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-white/20 bg-white/5">
            <div className="flex w-14 items-center justify-center border-r border-white/20 bg-white/5 px-3 font-mono text-sm font-semibold uppercase tracking-wider text-white/90">
              SOL
            </div>

            <Input
              type="number"
              inputMode="decimal"
              step={step}
              min={0.01}
              max={64}
              placeholder="0.01"
              value={Number.isFinite(amount) ? amount : 0}
              onChange={(e) => {
                const next = parseFloat(e.target.value);
                setAmount(Number.isFinite(next) ? next : 0);
              }}
              className="h-11 flex-1 border-0 bg-transparent px-4 font-mono text-lg font-semibold text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <button
              type="button"
              onClick={() =>
                setAmount((a) => Math.max(0, roundToStep(a - step)))
              }
              className="h-11 w-12 border-l border-white/20 bg-white/5 text-xl font-semibold text-white/90 hover:bg-white/10 active:bg-white/20"
              aria-label="Decrease amount"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setAmount((a) => roundToStep(a + step))}
              className="h-11 w-12 border-l border-white/20 bg-white/5 text-xl font-semibold text-white/90 hover:bg-white/10 active:bg-white/20"
              aria-label="Increase amount"
            >
              +
            </button>
          </div>

          <div className="mt-5">
            <Carousel
              className="w-[250px] mx-auto"
              opts={{
                loop: true,
                align: "start",
              }}
            >
              <CarouselContent className="-ml-3">
                {([0.01, 0.05, 0.1, 0.5, 1, 2, 4, 8, 16, 32, 64] as number[]).map(
                  (value) => (
                    <CarouselItem key={value} className="basis-1/4 pl-3">
                      <Button
                        size="lg"
                        onClick={() => setAmount(value)}
                        className={`w-full rounded-xl border-2 font-mono ${
                          amount === value ? selectedBtn : unselectedBtn
                        }`}
                      >
                        {value < 1 ? value.toFixed(2) : value}
                      </Button>
                    </CarouselItem>
                  )
                )}
              </CarouselContent>

              <CarouselPrevious className="left-[-52px] rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10" />
              <CarouselNext className="right-[-52px] rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10" />
            </Carousel>
          </div>
        </div>

        <div className="mt-6 w-full">
          <Button 
            onClick={() => handleBet(amount)}
            className={`h-12 w-full rounded-xl text-lg font-bold cursor-pointer border-2 ${
              isLoading
                ? "border-white/20 bg-white/5 text-white/70 opacity-80 animate-pulse"
                : selectedBtn
            }`}
            disabled={isLoading}
          >
              BET {amount && amount >= 1 ? amount : amount.toFixed(2)} SOL
          </Button>
        </div>
        </CardContent>

        <CardFooter className="bg-transparent border-white/10 justify-center">
          <WalletDisconnectButton />
        </CardFooter>
      </Card>

      <div className="w-full mt-10 overflow-y-auto">
        <Card className="mx-auto w-full max-w-[700px] min-h-[400px] bg-zinc-950/80 border border-white/10 text-white ring-1 ring-white/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold tracking-widest">Recent Games</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-md font-semibold tracking-widest text-white/70">
              <div>Wallet Public Key</div>
              <div className="text-right">Amount (SOL)</div>
              <div className="text-center">Choice</div>
              <div className="text-right">Result</div>
            </div>

            {isLoadingGames ? (
              <SkeletonLoaderLeaderboard />
            ) : (
              <div className="max-h-[300px] w-full overflow-y-auto rounded-xl [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
                <div className="flex flex-col gap-2 pr-3">
                  {games.map((game: Game) => (
                    <div
                      key={game.id}
                      className="grid grid-cols-4 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="min-w-0 truncate font-mono text-md text-white/85">
                        {truncateKey(game.user.walletPublicKey)}
                      </div>

                      <div className="text-center font-mono text-md text-white/85">
                        {(Number(game.betAmount) / LAMPORTS_PER_SOL).toFixed(3)}
                      </div>

                      <div className="text-center text-md uppercase tracking-wider text-white/80">
                        {game.choice}
                      </div>

                      <span
                        className={
                          game.result === "WIN"
                            ? "ml-auto w-fit rounded-full bg-amber-400 px-2 py-1 text-md font-semibold text-black"
                            : "ml-auto w-fit rounded-full bg-white/10 px-2 py-1 text-md font-semibold text-white/80"
                        }
                      >
                        {game.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}