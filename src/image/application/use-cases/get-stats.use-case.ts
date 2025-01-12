import { injectable } from 'tsyringe';
import { ImageProcessingStatsService } from '../services/image-processing-stats.service';
import { FilterStatsService } from '../services/filter-stats.service';
import { TotalNumberImagesPerPathService } from '../services/total-number-images-per-path.service';

@injectable()
export class GetStatsUseCase {
  constructor(
    private readonly imageProcessingStatsService: ImageProcessingStatsService,
    private readonly filterStatsService: FilterStatsService,
    private readonly totalNumberImagesPerPathService: TotalNumberImagesPerPathService,
  ) {}

  async execute() {
    const [processingTimes, filterStats, totalNumberImagesPerPathStats] = await Promise.all([
      this.imageProcessingStatsService.getImagesProcessingTimes(),
      this.filterStatsService.getFilterUsageStats(),
      this.totalNumberImagesPerPathService.execute(),
    ]);

    const results = {
      processingTimes,
      filterStats,
      totalNumberImagesPerPathStats,
    };

    return results;
  }
}
