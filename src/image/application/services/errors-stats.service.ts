import { injectable } from "tsyringe";
import { ErrorRepository } from "../../infraestructure/repositories/error.repository";
import { ProcessName } from "../../utils/constants";

@injectable()
export class ErrorsStatsService {
  constructor(private readonly errorRepository: ErrorRepository) {}

  async execute() {
    // TODO: refactor, do not repeat
    const detectionErrors = await this.errorRepository.findAllByProcess(ProcessName.DETECTION);
    const transformErrors = await this.errorRepository.findAllByProcess(ProcessName.TRANSFORMATION);
    const categorizationErrors = await this.errorRepository.findAllByProcess(ProcessName.CATEGORIZATION);

    const categorizationStats = {
      total: categorizationErrors.length,
      imageIds: categorizationErrors.map((error) => error.imageId),
    }

    const detectionStats = {
      total: detectionErrors.length,
      imageIds: detectionErrors.map((error) => error.imageId),
    }

    const transformStats = {
      total: transformErrors.length,
      imageIds: transformErrors.map((error) => error.imageId),
    }

    return {
      transformStats,
      categorizationStats,
      detectionStats,
    };
  }
}
