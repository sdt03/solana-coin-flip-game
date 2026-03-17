/*
  Warnings:

  - A unique constraint covering the columns `[txSignature]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[txSignature]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `txSignature` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `txSignature` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "txSignature" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "txSignature" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Game_txSignature_key" ON "Game"("txSignature");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txSignature_key" ON "Transaction"("txSignature");
