import { ImageRepository } from '../../infraestructure/repositories/image.repository';
import { LogRepository } from '../../infraestructure/repositories/log.repository';

export class GetStatsUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly logRepository: LogRepository,
  ) {}

  async execute() {
    return {};
  }
}
