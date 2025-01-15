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
    this.categorizationQueueFinished();
    this.transformationQueueFinished();
    console.log('### after queuesFinished', new Date().toISOString());
  }
  async categorizationQueueFinished() {
    const categorizationQueueEvents = new QueueEvents(ImageCategorizationQueue.queueName);
    const cleanup = () => {
      categorizationQueueEvents.removeAllListeners();
      // Remove other queue event listeners
    };

    try {
      const categorizationDrainedPromise = new Promise((resolve) => {
        categorizationQueueEvents.on('drained', () => {
          console.log('p categorizationQueueEvents is drained.');
          resolve(void 0);
        });
      });

      await categorizationDrainedPromise;
    } catch (error) {
      console.error('Error setting up categorization queue event listener:', error);
    } finally {
      console.log('p categorizationQueueEvents finally.', new Date());
    }
  }

  async transformationQueueFinished() {
    const transformationQueueEvents = new QueueEvents(ImageTransformationQueue.queueName);

    try {
      const transformationDrainedPromise = new Promise((resolve) => {
        transformationQueueEvents.on('drained', () => {
          console.log('p transformationQueueEvents is drained.');
          resolve(void 0);
        });
      });

      await transformationDrainedPromise;
    } catch (error) {
      console.error('Error setting up transformation queue event listener:', error);
    } finally {
      console.log('p transformationQueueEvents finally.', new Date());
    }
  }
}
