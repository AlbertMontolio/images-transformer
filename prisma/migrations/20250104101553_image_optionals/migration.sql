/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Image_name_key";

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "width" DROP NOT NULL,
ALTER COLUMN "height" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Image_path_key" ON "Image"("path");
