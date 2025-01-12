import { prisma } from "../prisma/prisma-client";

type ProcessName = 'object_detection' | 'transformation' | 'categorization';

export class LogRepository {
  async create({
    imageId,
    processName,
    status,
  }: {
    imageId: number;
    processName: ProcessName;
    status: 'started' | 'completed' | 'error';
  }) {
    try {
      return await prisma.log.create({
        data: {
          imageId,
          processName,
          status,
        }
      });
    } catch (err) {
      console.error('Error creating log:', err);
      throw err;
    }
  }

  async findByImageIdAndStatusAndProcessName({
    imageId,
    processName,
    status,
  }: {
    imageId: number;
    processName: string;
    status: string;
  }) {
    return await prisma.log.findUnique({
      where: {
        imageId_processName_status: {
          imageId,
          processName,
          status,
        }
      }
    })
  }

  async findAllByImageId(imageId: number) {
    return await prisma.log.findMany({
      where: {
        imageId,
      }
    });
  }
}
