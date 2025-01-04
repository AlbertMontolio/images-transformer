/*
  Warnings:

  - You are about to drop the `ImageLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImageLog" DROP CONSTRAINT "ImageLog_imageId_fkey";

-- DropTable
DROP TABLE "ImageLog";
