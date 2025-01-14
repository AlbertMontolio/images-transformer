/*
  Warnings:

  - Changed the type of `status` on the `Log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('STARTED', 'COMPLETED', 'ERROR');

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "status",
ADD COLUMN     "status" "ProcessStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "Log_status_idx" ON "Log"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Log_imageId_processName_status_key" ON "Log"("imageId", "processName", "status");
