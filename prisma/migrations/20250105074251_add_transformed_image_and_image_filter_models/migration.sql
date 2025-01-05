-- CreateTable
CREATE TABLE "TransformedImage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "TransformedImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageFilter" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "ImageFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransformedImage_imageId_key" ON "TransformedImage"("imageId");

-- AddForeignKey
ALTER TABLE "TransformedImage" ADD CONSTRAINT "TransformedImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageFilter" ADD CONSTRAINT "ImageFilter_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
