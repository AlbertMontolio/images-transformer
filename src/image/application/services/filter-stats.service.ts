import { injectable } from 'tsyringe';
import { prisma } from '../../infraestructure/prisma/prisma-client';

type FilterStats = {
  [filterType: string]: number;
};

@injectable()
export class FilterStatsService {
  async getFilterUsageStats(): Promise<FilterStats> {
    const transformedImages = await prisma.transformedImage.findMany({
      select: {
        filterType: true,
      },
      where: {
        filterType: { not: null },
      },
    });

    const stats: FilterStats = {};

    transformedImages.forEach((image) => {
      if (!image.filterType) return;
      
      stats[image.filterType] = (stats[image.filterType] || 0) + 1;
    });

    return stats;
  }
}