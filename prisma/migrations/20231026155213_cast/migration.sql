/*
  Warnings:

  - You are about to alter the column `NAME` on the `XfmrDriverProfile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE "XfmrDriverProfile" ALTER COLUMN "NAME" SET DATA TYPE VARCHAR(20);
