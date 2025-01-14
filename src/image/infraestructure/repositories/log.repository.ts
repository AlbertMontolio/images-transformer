import { prisma } from "../prisma/prisma-client";
import { Status } from "@prisma/client";

export class LogRepository {
  async create({
    imageId,
    processName,
    status,
  }: {
    imageId: number;
    processName: string;
    status: Status;
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

  async createStartedProcessLog(imageId: number, processName: string) {
    return await this.create({
      imageId,
      processName,
      status: Status.STARTED
    });
  }

  async createCompletedProcessLog(imageId: number, processName: string) {
    return await this.create({
      imageId,
      processName,
      status: Status.COMPLETED
    });
  }

  async findByImageIdAndStatusAndProcessName({
    imageId,
    processName,
    status,
  }: {
    imageId: number;
    processName: string;
    status: Status;
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
