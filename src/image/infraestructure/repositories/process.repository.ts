import { Process } from '@prisma/client';
import { prisma } from '../prisma/prisma-client';

export class ProcessRepository {
  constructor() {}

  async create(data: {
    name: string;
    projectId: number;
  }): Promise<Process> {
    return prisma.process.create({
      data: {
        name: data.name,
        projectId: data.projectId,
      },
    });
  }

  async update(id: number, data: {
    finishedAt?: Date;
  }): Promise<Process> {
    return prisma.process.update({
      where: { id },
      data: {
        ...data
      },
    });
  }
}