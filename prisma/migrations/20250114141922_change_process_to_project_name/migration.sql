/*
  Warnings:

  - You are about to drop the column `processId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the `Process` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `projectId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('STARTED', 'COMPLETED', 'ERROR');

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_processId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "processId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- DropTable
DROP TABLE "Process";

-- DropEnum
DROP TYPE "ProcessStatus";

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Log_status_idx" ON "Log"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Log_imageId_processName_status_key" ON "Log"("imageId", "processName", "status");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
