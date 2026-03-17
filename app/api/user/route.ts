import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {
  const { searchParams } = new URL(request.url);
  const walletPublicKey = searchParams.get("walletPublicKey");
  if (!walletPublicKey) {
    return;
  }
  const user = await prisma.user.upsert({
    where: { walletPublicKey },
    update: {
      walletPublicKey,
    },
    create: {
      walletPublicKey,
    },
  });
  return NextResponse.json(user);
}