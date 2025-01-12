import { container } from 'tsyringe';
import { TransformImageService } from '../image/infraestructure/services/transform-image.service';
import { LogRepository } from '../image/infraestructure/repositories/log.repository';
import { TransformImageHandler } from '../image/application/handlers/transform-image.handler';
import { CommandBus } from './command-bus/command-bus';

container.registerSingleton(TransformImageService);
container.registerSingleton(LogRepository);
container.registerSingleton(TransformImageHandler);
container.registerSingleton(CommandBus);

export { container }; 