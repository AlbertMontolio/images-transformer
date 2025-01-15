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

    if (!project) {
      throw new Error('Project not found');
    }

    const stats = {
      projectId: project.id,
      projectName: project.name,
    }

    return stats;
  }

  async getTransformationLastWrittenAt() {

    return null;
  }
}

