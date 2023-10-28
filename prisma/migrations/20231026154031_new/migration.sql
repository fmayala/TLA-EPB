/*
  Warnings:

  - You are about to drop the column `KVA_EXPENDITURE` on the `XfmrDriverProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "XfmrDriverProfile" DROP COLUMN "KVA_EXPENDITURE",
ADD COLUMN     "KWH_EXPENDITURE" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "TIME_INTERVAL" INTEGER NOT NULL DEFAULT 0;
