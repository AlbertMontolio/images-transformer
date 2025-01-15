import { injectable } from 'tsyringe';
import { prisma } from '../../infraestructure/prisma/prisma-client';

type Result = {
  total: number;
  filters: FilterStats;
};

type FilterStats = {
  [filterType: string]: number;
};

@injectable()
export class FilterStatsService {
  async getFilterUsageStats(): Promise<Result> {
    const transformedImages = await prisma.transformedImage.findMany({
      select: {
        filterType: true,
      },
      where: {
        filterType: { not: null },
      },
    });

    const stats: FilterStats = {};

    // TODO: use sql queries instead of in memory computations
    let total = 0;
    transformedImages.forEach((image) => {
      if (!image.filterType) return;
      total++;
      stats[image.filterType] = (stats[image.filterType] || 0) + 1;
    });

    return {
      total,
      filters: stats,
    };
  }
}