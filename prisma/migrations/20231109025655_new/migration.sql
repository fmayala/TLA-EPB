/*
  Warnings:

  - The primary key for the `XfmrMeasure` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "XfmrMeasure" DROP CONSTRAINT "XfmrMeasure_pkey",
ADD CONSTRAINT "XfmrMeasure_pkey" PRIMARY KEY ("ID", "MEASURE_DATE");
