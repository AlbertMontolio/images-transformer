import { injectable } from 'tsyringe';
import { FilterStatsService } from '../services/filter-stats.service';
import { TotalNumberImagesPerPathService } from '../services/total-number-images-per-path.service';
import { ProjectStatsService } from '../services/project-stats.service';
import { ProcessesStatsService } from '../services/process-stats.service';
import { ErrorsStatsService } from '../services/errors-stats.service';

@injectable()
export class GetStatsUseCase {
  constructor(
    private readonly processesStatsService: ProcessesStatsService,
    private readonly filterStatsService: FilterStatsService,
    private readonly totalNumberImagesPerPathService: TotalNumberImagesPerPathService,
    private readonly projectStatsService: ProjectStatsService,
    private readonly errorsStatsService: ErrorsStatsService,
  ) {}

  async execute(projectId: number = 1) {
    const [processesStats, filterStats, totalNumberImagesPerPathStats, projectStats, errorsStats] = await Promise.all([
      this.processesStatsService.execute(projectId),
      this.filterStatsService.getFilterUsageStats(),
      this.totalNumberImagesPerPathService.execute(),
      this.projectStatsService.getProjectStats(projectId),
      this.errorsStatsService.execute(),
    ]);

    const results = {
      projectStats,
      processesStats,
      totalNumberImagesPerPathStats,
      filterStats,
      errorsStats,
    };

    return results;
  }
}
