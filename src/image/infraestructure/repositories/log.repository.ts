import { prisma } from "../prisma/prisma-client";

// ### TODO: add enums from Prisma
export type ProcessName = 'object_detection' | 'transformation' | 'categorization' | 'transformation_storage';

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
    console.log(`log> imageId:${imageId} \t processName: ${processName} \t status: ${status}`)
    try {
      // First check if the log already exists
      const existingLog = await prisma.log.findUnique({
        where: {
          imageId_processName_status: {
            imageId,
            processName,
            status,
          }
        }
      });

      // If it exists, return it
      if (existingLog) {
        console.log('### log already exists');
        return existingLog;
      }

      // If it doesn't exist, create a new one
      return await prisma.log.create({
        data: {
          imageId,
          processName,
          status,
        },
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
