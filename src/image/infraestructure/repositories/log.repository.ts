import { prisma } from "../prisma/prisma-client";

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
      console.log('### err:', err)
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
}
