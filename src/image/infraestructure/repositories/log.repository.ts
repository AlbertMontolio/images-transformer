import { prisma } from "../prisma/prisma-client";
import { ProcessStatus } from "@prisma/client";

export class LogRepository {
  async create({
    imageId,
    processName,
    status,
  }: {
    imageId: number;
    processName: string;
    status: ProcessStatus;
  }) {
    console.log(`log> imageId:${imageId} \t processName: ${processName} \t status: ${status}`)
    try {
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
    status: ProcessStatus;
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
