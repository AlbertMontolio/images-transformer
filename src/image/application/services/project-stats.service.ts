import { ProjectRepository } from "../../infraestructure/repositories/project.repository";
import { TransformedImageRepository } from "../../infraestructure/repositories/transformed-image.repository";
import { injectable } from "tsyringe";

@injectable()
export class ProjectStatsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly transformedImageRepository: TransformedImageRepository,
  ) {}

  async getProjectStats(projectId: number) {
    const project = await this.projectRepository.getById(projectId);
    console.log('project', project);

    if (!project) {
      throw new Error('Project not found');
    }

    const lastWrittenAt = null;
    console.log('lastWrittenAt', lastWrittenAt);
    const duration = lastWrittenAt ? lastWrittenAt.getTime() - project.createdAt.getTime() : 0;
    const durationInSeconds = duration / 1000;

    const projectFinishedAt = lastWrittenAt ? lastWrittenAt : project.finishedAt;

    const stats = {
      projectId: project.id,
      projectName: project.name,
      projectStatus: project.status,
      projectStartedAt: project.createdAt,
      projectFinishedAt,
      projectDuration: durationInSeconds,
    }

    return stats;
  }

  async getTransformationLastWrittenAt() {

    return null;
  }
}

