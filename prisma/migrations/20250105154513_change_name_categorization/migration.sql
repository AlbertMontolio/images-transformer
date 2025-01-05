/*
  Warnings:

  - You are about to drop the `Classification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Classification" DROP CONSTRAINT "Classification_imageId_fkey";

-- DropTable
DROP TABLE "Classification";

-- CreateTable
CREATE TABLE "Categorization" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "Categorization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Categorization" ADD CONSTRAINT "Categorization_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
