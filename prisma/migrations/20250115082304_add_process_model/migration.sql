-- CreateTable
CREATE TABLE "Process" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
