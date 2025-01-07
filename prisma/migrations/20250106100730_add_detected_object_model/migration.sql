-- CreateTable
CREATE TABLE "DetectedObject" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "class" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "DetectedObject_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DetectedObject" ADD CONSTRAINT "DetectedObject_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
