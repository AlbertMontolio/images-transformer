import { injectable, inject } from 'tsyringe';
import { ReadImagesNamesUseCase } from "./read-images-names.use-case";
import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case";
import { ImageCategorizationQueue } from "../../infraestructure/queues/image-categorization.queue";
import { ImageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue";
import { ImageDetectionQueue } from "../../infraestructure/queues/image-detection.queue";
import { INJECTION_TOKENS } from '../../../shared/injection-tokens';
import { inputImagesDir, redisHost } from '../../config';
import { QueueEvents } from 'bullmq';
import { ProcessRepository } from '../../infraestructure/repositories/process.repository';
import { ProcessName } from '../../utils/constants';
import { Image } from '@prisma/client';
import { RedisPublisherService } from '../../../shared/services/redis-publisher.service';

@injectable()
export class ProcessImagesUseCase {
  private readonly BATCH_SIZE = 20; // Reduce from 100 to 20
  
  constructor(
    @inject(ReadImagesNamesUseCase) 
    private readonly readImagesNamesUseCase: ReadImagesNamesUseCase,
    @inject(CreateImagesInDbUseCase)
    private readonly createImagesInDbUseCase: CreateImagesInDbUseCase,
    @inject(INJECTION_TOKENS.IMAGE_CATEGORIZATION_QUEUE)
    private readonly imageCategorizationQueue: ImageCategorizationQueue,
    @inject(INJECTION_TOKENS.IMAGE_TRANSFORMATION_QUEUE)
    private readonly imageTransformationQueue: ImageTransformationQueue,
    @inject(INJECTION_TOKENS.IMAGE_DETECTION_QUEUE)
    private readonly imageDetectionQueue: ImageDetectionQueue,
    @inject(ProcessRepository)
    private readonly processRepository: ProcessRepository
  ) {}

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async execute(projectId: number) {
    const transformProcess = await this.processRepository.create({ name: ProcessName.TRANSFORMATION, projectId });
    const categorizationProcess = await this.processRepository.create({ name: ProcessName.CATEGORIZATION, projectId });
    const detectionProcess = await this.processRepository.create({ name: ProcessName.DETECTION, projectId });

    const inputPath = inputImagesDir
    const imagesFilesNames = await this.readImagesNamesUseCase.execute(inputPath)

    if (!imagesFilesNames) {
      return
    }

    const fileNameBatches = this.createBatches(imagesFilesNames, this.BATCH_SIZE);

    for (const fileNameBatch of fileNameBatches) {
      const images = await this.createImagesInDbUseCase.executeMany(fileNameBatch, projectId);

      this.sendSavedImagesToSocket(images);

      await Promise.all([
        this.imageCategorizationQueue.addBulk(
          images.map(image => ({
            name: 'categorize-image', // TODO: change to ProcessName.CATEGORIZATION
            data: image
          }))
        ),
        this.imageTransformationQueue.addBulk(
          images.map(image => ({
            name: 'transform-image',
            data: image
          }))
        ),
        this.imageDetectionQueue.addBulk(
          images.map(image => ({
            name: 'detect-objects',
            data: image
          }))
        )
      ]);
    }

    // TODO: improve, use MQTT broker, to inform client
    this.waitForQueueDrain(ImageTransformationQueue.queueName, transformProcess.id);
    this.waitForQueueDrain(ImageCategorizationQueue.queueName, categorizationProcess.id);
    this.waitForQueueDrain(ImageDetectionQueue.queueName, detectionProcess.id);
  }

  private sendSavedImagesToSocket(images: Image[]) {
    // comment
    for (const image of images) {
      RedisPublisherService.getInstance().publish({
        type: 'saved-image',
        data: {
          imageId: image.id,
          status: 'pending',
          image,
        }
      });
    }
  }

  private async waitForQueueDrain(queueName: string, processId: number) {
    const queueEvents = new QueueEvents(queueName, {
      connection: {
        host: redisHost,
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });
    const cleanup = () => {
      queueEvents.removeAllListeners();
    };

    try {
      const drainedPromise = new Promise((resolve) => {
        queueEvents.on('drained', () => {
          console.log(`${queueName} queue is drained.`);
          resolve(void 0);
        });
      });

      await drainedPromise;
    } catch (error) {
      console.error(`Error setting up ${queueName} queue event listener:`, error);
    } finally {
      console.log(`${queueName} queue finally.`, new Date());
      await this.processRepository.update(processId, { finishedAt: new Date() });
      cleanup();
    }
  }
}
