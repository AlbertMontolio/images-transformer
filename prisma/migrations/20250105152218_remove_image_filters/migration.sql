/*
  Warnings:

  - You are about to drop the `ImageFilter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImageFilter" DROP CONSTRAINT "ImageFilter_transformedImageId_fkey";

-- AlterTable
ALTER TABLE "TransformedImage" ADD COLUMN     "filterType" TEXT,
ADD COLUMN     "filterValue" TEXT;

-- DropTable
DROP TABLE "ImageFilter";
