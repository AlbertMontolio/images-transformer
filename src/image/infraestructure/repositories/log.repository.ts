import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LogRepository {
  async create({
    imageId,
    status,
  }: {
    imageId: number;
    status: string;
  }) {
    try {
      await prisma.log.create({
        data: {
          imageId,
          status,
        }
      })
    } catch (err) {
      console.log('### err:::', err)
    }
  }

  async findLogByImageIdAndStatus({
    imageId,
    status,
  }: {
    imageId: number;
    status?: string;
  }) {
    const log = await prisma.log.findFirst({
      where: {
        imageId,
        status,
      }
    })

    return log;
  }

  async updateLogById({
    logId,
    status,
    finishedAt,
  }: {
    logId: number;
    status?: string;
    finishedAt?: Date;
  }) {
    await prisma.log.update({
      where: {
        id: logId,
      },
      data: {
        finishedAt,
      }
    })
  }
}

// ### TODO: move prisma client creation into a single file, single instance
// ### handle prisma.$disconnect()