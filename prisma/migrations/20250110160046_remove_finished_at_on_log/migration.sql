/*
  Warnings:

  - You are about to drop the column `finishedAt` on the `Log` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Image_path_key";

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "path" DROP NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "finishedAt";

-- CreateIndex
CREATE UNIQUE INDEX "Image_name_key" ON "Image"("name");
