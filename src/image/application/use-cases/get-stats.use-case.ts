import { injectable } from 'tsyringe';
import { ImageProcessingStatsService } from '../services/image-processing-stats.service';
import { FilterStatsService } from '../services/filter-stats.service';
import { TotalNumberImagesPerPathService } from '../services/total-number-images-per-path.service';
import { ProjectStatsService } from '../services/project-stats.service';

@injectable()
export class GetStatsUseCase {
  constructor(
    private readonly imageProcessingStatsService: ImageProcessingStatsService,
    private readonly filterStatsService: FilterStatsService,
    private readonly totalNumberImagesPerPathService: TotalNumberImagesPerPathService,
    private readonly projectStatsService: ProjectStatsService,
  ) {}

  async execute(projectId: number = 1) {
    const [processingTimes, filterStats, totalNumberImagesPerPathStats, projectStats] = await Promise.all([
      this.imageProcessingStatsService.getImagesProcessingTimes(),
      this.filterStatsService.getFilterUsageStats(),
      this.totalNumberImagesPerPathService.execute(),
      this.projectStatsService.getProjectStats(projectId),
    ]);

    const results = {
      projectStats,
      processingTimes,
      totalNumberImagesPerPathStats,
      filterStats,
    };

    return results;
  }
}
