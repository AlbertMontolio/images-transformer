import { GetStatsUseCase } from "../application/use-cases/get-stats.use-case";
import { ProcessImagesUseCase } from "../application/use-cases/process-images.use-case";
import { ImageRepository } from "../infraestructure/repositories/image.repository";

// dependencies
const imageRepository = new ImageRepository();
const processImagesUseCase = new ProcessImagesUseCase();
const getStatsUseCase = new GetStatsUseCase();

export const dependencies = {
  imageRepository,
  processImagesUseCase,
  getStatsUseCase,
};
