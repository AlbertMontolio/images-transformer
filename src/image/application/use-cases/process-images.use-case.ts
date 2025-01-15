import { injectable, inject } from 'tsyringe';
import { ReadImagesNamesUseCase } from "./read-images-names.use-case";
import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case";
import { ImageCategorizationQueue } from "../../infraestructure/queues/image-categorization.queue";
import { ImageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue";
import { ImageDetectionQueue } from "../../infraestructure/queues/image-detection.queue";
import { INJECTION_TOKENS } from '../../../shared/injection-tokens';
import { inputImagesDir } from '../../config';
import { QueueEvents } from 'bullmq';

@injectable()
export class ProcessImagesUseCase {
  private readonly BATCH_SIZE = 5; // Adjust based on your needs
  
  constructor(
    @inject(ReadImagesNamesUseCase) 
    private readonly readImagesNamesUseCase: ReadImagesNamesUseCase,
    @inject(CreateImagesInDbUseCase)
    private readonly createImagesInDbUseCase: CreateImagesInDbUseCase,
    @inject(INJECTION_TOKENS.IMAGE_CATEGORIZATION_QUEUE)
    private readonly imageCategorizationQueue: ImageCategorizationQueue,
    @inject(INJECTION_TOKENS.IMAGE_TRANSFORMATION_QUEUE)
    // ### TODO: i think it's not necessary to inject in process images usecase
    private readonly imageTransformationQueue: ImageTransformationQueue,
    @inject(INJECTION_TOKENS.IMAGE_DETECTION_QUEUE)
    private readonly imageDetectionQueue: ImageDetectionQueue
  ) {}

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async execute(projectId: number) {
    const inputPath = inputImagesDir
    const imagesFilesNames = await this.readImagesNamesUseCase.execute(inputPath)

    if (!imagesFilesNames) {
      return
    }

    const fileNameBatches = this.createBatches(imagesFilesNames, this.BATCH_SIZE);

    for (const fileNameBatch of fileNameBatches) {
      const images = await this.createImagesInDbUseCase.executeMany(fileNameBatch, projectId);
      await Promise.all([
        this.imageCategorizationQueue.addBulk(
          images.map(image => ({
            name: 'categorize-image',
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

    console.log('### before queuesFinished', new Date().toISOString());
    this.waitForQueueDrain(ImageTransformationQueue.queueName);
    this.waitForQueueDrain(ImageCategorizationQueue.queueName);
    this.waitForQueueDrain(ImageDetectionQueue.queueName);
    console.log('### after queuesFinished', new Date().toISOString());
  }

  async waitForQueueDrain(queueName: string) {
    const queueEvents = new QueueEvents(queueName);
    const cleanup = () => {
      queueEvents.removeAllListeners();
    };

    try {
      const drainedPromise = new Promise((resolve) => {
        queueEvents.on('drained', () => {
          console.log(`${queueName}QueueEvents is drained.`);
          resolve(void 0);
        });
      });

      await drainedPromise;
    } catch (error) {
      console.error(`Error setting up ${queueName} queue event listener:`, error);
    } finally {
      console.log(`${queueName} queue finally.`, new Date());
      cleanup();
    }
  }
}
