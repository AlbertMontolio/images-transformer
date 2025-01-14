import { Project, Status } from '@prisma/client';
import { prisma } from '../prisma/prisma-client';

export class ProjectRepository {
  async create(data: {
    name?: string;
    finishedAt?: Date;
  }): Promise<Project> {
    return prisma.project.create({
      data: {
        name: data.name,
        status: Status.STARTED,
        finishedAt: data.finishedAt,
      },
    });
  }

  async getById(id: number): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id }
    });
  }
}
