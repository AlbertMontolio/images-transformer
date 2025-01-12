/*
  Warnings:

  - Added the required column `processName` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "processName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Log_imageId_idx" ON "Log"("imageId");

-- CreateIndex
CREATE INDEX "Log_status_idx" ON "Log"("status");

-- CreateIndex
CREATE INDEX "Log_processName_idx" ON "Log"("processName");
