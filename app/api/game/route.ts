import { GameChoice, GameResult, TransactionType } from "@/lib/generated/prisma/enums";
import { calculateFees, handleGameFlip } from "@/lib/helpers";
import { prisma } from "@/prisma";
import { Connection, Keypair, ParsedTransactionWithMeta, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";
import { NextRequest, NextResponse } from "next/server";

const connection = new Connection(clusterApiUrl("devnet"), {
  commitment: "confirmed",
});

export async function POST(request: NextRequest) {
  try{
    const { txSignature, choice: rawChoice } = await request.json();

  const choice: GameChoice =
    rawChoice === GameChoice.HEADS || rawChoice === GameChoice.TAILS
      ? rawChoice
      : rawChoice.toUpperCase() === "HEADS"
      ? GameChoice.HEADS
      : GameChoice.TAILS;
  const gameResult = handleGameFlip(choice);

  const walletDetails = await connection.getParsedTransaction(txSignature, { commitment: "confirmed" });
  console.log(walletDetails);

  const sender = walletDetails?.transaction?.message?.accountKeys[0]?.pubkey;
  const betAmount = calculateBaseAmount(walletDetails!);

  if (gameResult === GameResult.WIN) {
    const platformBalance = await connection.getBalance(platformKeyPair.publicKey);
    const payout = betAmount * 2 - calculateFees(betAmount);

    console.log('paying user: ', sender!.toString(), 'amount: ', payout);
  
  if (platformBalance < payout) {
    return NextResponse.json(
      { message: "House has insufficient funds for this payout" },
      { status: 400 }
    );
  }
    //send twice the money and save in db
    const tx = new Transaction().add(SystemProgram.transfer({
      fromPubkey: platformKeyPair.publicKey,
      toPubkey: sender!,
      lamports: payout,
    }));
    const signature = await sendAndConfirmTransaction(connection, tx, [platformKeyPair]);
    console.log('signature from payout: ', signature.toString());
    const user = await prisma.user.findUnique({
      where: {
        walletPublicKey: sender!.toString(),
      },
    });

    const game = await prisma.game.create({
      data: {
        userId: user!.id,
        betAmount: betAmount,
        txSignature: signature.toString(),
        choice,
        result: GameResult.WIN,
      }
    });

    await prisma.transaction.create({
      data: {
        userId: user!.id,
        gameId: game!.id,
        txSignature: signature.toString(),
        transactionType: TransactionType.PAYOUT,
        amount: betAmount * 2 - calculateFees(betAmount),
      }
    });
    return NextResponse.json({ message: "Game result is win" }, { status: 200 });
  } else {
    const user = await prisma.user.findUnique({
      where: {
        walletPublicKey: sender!.toString(),
      },
    });

    const game = await prisma.game.create({
      data: {
        userId: user!.id,
        betAmount: betAmount,
        txSignature: txSignature,
        choice,
        result: GameResult.LOSS,
      }
    });

    await prisma.transaction.create({
      data: {
        userId: user!.id,
        gameId: game!.id,
        txSignature: txSignature,
        transactionType: TransactionType.BET,
        amount: betAmount,
      }
    });
    return NextResponse.json({ message: "Game result is loss" }, { status: 200 });
  }
} catch (error) {
  console.error(error);
  return NextResponse.json({ message: (error as Error).message }, { status: 500 });
}
}

export async function GET(_request: NextRequest) {
  try{
    const games = await prisma.game.findMany({
      include:{
        user:{
          select:{
            walletPublicKey: true,
          }
        },
        transactions:{
          select:{
            transactionType: true,
            amount: true,
          }
        }
      },
      orderBy:{
        createdAt: "desc",
      },
      take: 10,
      });
      const safeGames = games.map((g) => ({
        ...g,
        betAmount: g.betAmount.toString(),
        transactions: g.transactions.map((t) => ({
          ...t,
          amount: t.amount.toString(),
        })),
      }));
      return NextResponse.json(safeGames);
    } 
  catch (error) {
    console.error(error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

const calculateBaseAmount = (walletDetails: ParsedTransactionWithMeta) => {
  const preBalance = walletDetails?.meta?.preBalances[0];
  const postBalance = walletDetails?.meta?.postBalances[0];
  return preBalance! - postBalance!;
};

const platformKeyPair = Keypair.fromSecretKey(
  bs58.decode(process.env.PRIVATE_KEY!)
);

