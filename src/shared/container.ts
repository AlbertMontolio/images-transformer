import { container } from 'tsyringe';
import { TransformImageService } from '../image/infraestructure/services/transform-image.service';
import { LogRepository } from '../image/infraestructure/repositories/log.repository';
import { TransformImageHandler } from '../image/application/handlers/transform-image.handler';
import { CommandBus } from './command-bus/command-bus';
import { ProcessImagesUseCase } from '../image/application/use-cases/process-images.use-case';
import { ReadImagesNamesUseCase } from '../image/application/use-cases/read-images-names.use-case';
import { CreateImagesInDbUseCase } from '../image/application/use-cases/create-images-in-db.use-case';
import { ImageCategorizationQueue } from '../image/infraestructure/queues/image-categorization.queue';
import { ImageDetectionQueue } from '../image/infraestructure/queues/image-detection.queue';
import { INJECTION_TOKENS } from './injection-tokens';
import { ImageRepository } from '../image/infraestructure/repositories/image.repository';
import { GetStatsUseCase } from '../image/application/use-cases/get-stats.use-case';
import { FilterStatsService } from '../image/application/services/filter-stats.service';
import { TotalNumberImagesPerPathService } from '../image/application/services/total-number-images-per-path.service';
import { WriteImageService } from '../image/infraestructure/services/write-image.service';
import { ProjectRepository } from '../image/infraestructure/repositories/project.repository';
import { ImageTransformationQueue } from '../image/infraestructure/queues/image-transformation.queue';

// Register services
container.registerSingleton(TransformImageService);
container.registerSingleton(LogRepository);
// TODO: use it at some point
// container.registerSingleton(TransformImageHandler);
container.registerSingleton(CommandBus);

// Register use cases
container.registerSingleton(ProcessImagesUseCase);
container.registerSingleton(ReadImagesNamesUseCase);
container.registerSingleton(CreateImagesInDbUseCase);
container.registerSingleton(GetStatsUseCase);
// Register queues
container.register(INJECTION_TOKENS.IMAGE_CATEGORIZATION_QUEUE, {
  useValue: ImageCategorizationQueue.getInstance()
});
// ### TODO: i think it's not necessary to inject in process images usecase
container.register(INJECTION_TOKENS.IMAGE_TRANSFORMATION_QUEUE, {
  useValue: ImageTransformationQueue.getInstance()
});
container.register(INJECTION_TOKENS.IMAGE_DETECTION_QUEUE, {
  useValue: ImageDetectionQueue.getInstance()
});

// Register repositories
container.registerSingleton(ImageRepository);
container.registerSingleton(ProjectRepository);

container.registerSingleton(
  'FilterStatsService',
  FilterStatsService
);
container.registerSingleton('TotalNumberImagesPerPathService', TotalNumberImagesPerPathService);
container.registerSingleton('WriteImageService', WriteImageService);

export { container }; 