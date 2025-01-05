/*
  Warnings:

  - You are about to drop the column `imageId` on the `ImageFilter` table. All the data in the column will be lost.
  - Added the required column `transformedImageId` to the `ImageFilter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ImageFilter" DROP CONSTRAINT "ImageFilter_imageId_fkey";

-- AlterTable
ALTER TABLE "ImageFilter" DROP COLUMN "imageId",
ADD COLUMN     "transformedImageId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ImageFilter" ADD CONSTRAINT "ImageFilter_transformedImageId_fkey" FOREIGN KEY ("transformedImageId") REFERENCES "TransformedImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
