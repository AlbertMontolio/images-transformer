/*
  Warnings:

  - A unique constraint covering the columns `[imageId,processName,status]` on the table `Log` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Log_imageId_processName_status_key" ON "Log"("imageId", "processName", "status");
