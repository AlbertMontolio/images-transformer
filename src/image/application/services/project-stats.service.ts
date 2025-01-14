import { ProjectRepository } from "../../infraestructure/repositories/project.repository";
import { injectable } from "tsyringe";

@injectable()
export class ProjectStatsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
  ) {}

  async getProjectStats(projectId: number) {
    const project = await this.projectRepository.getById(projectId);
    console.log('project', project);

    if (!project) {
      throw new Error('Project not found');
    }

    const duration = project.finishedAt ? project.finishedAt.getTime() - project.createdAt.getTime() : 0;
    const durationInSeconds = duration / 1000;

    const stats = {
      projectId: project.id,
      projectName: project.name,
      projectStatus: project.status,
      projectStartedAt: project.createdAt,
      projectFinishedAt: project.finishedAt,
      projectDuration: durationInSeconds,
    }

    return stats;
  }
}

