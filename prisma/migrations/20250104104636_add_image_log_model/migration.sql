-- CreateTable
CREATE TABLE "ImageLog" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "ImageLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImageLog" ADD CONSTRAINT "ImageLog_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
