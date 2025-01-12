import 'reflect-metadata';
import { ProcessImagesUseCase } from '../process-images.use-case';
import { ReadImagesNamesUseCase } from '../read-images-names.use-case';
import { CreateImagesInDbUseCase } from '../create-images-in-db.use-case';
import { ImageCategorizationQueue } from '../../../infraestructure/queues/image-categorization.queue';
import { ImageTransformationQueue } from '../../../infraestructure/queues/image-transformation.queue';
import { ImageDetectionQueue } from '../../../infraestructure/queues/image-detection.queue';
import { ImageRepository } from '../../../infraestructure/repositories/image.repository';
import { container } from 'tsyringe';
import { INJECTION_TOKENS } from '../../../../shared/injection-tokens';

jest.mock('../read-images-names.use-case');
jest.mock('../create-images-in-db.use-case');
jest.mock('../../../infraestructure/repositories/image.repository');
jest.mock('../../../infraestructure/queues/image-categorization.queue');
jest.mock('../../../infraestructure/queues/image-transformation.queue');
jest.mock('../../../infraestructure/queues/image-detection.queue');

describe('ProcessImagesUseCase', () => {
  let useCase: ProcessImagesUseCase;
  let mockReadImagesNames: jest.Mocked<ReadImagesNamesUseCase>;
  let mockCreateImagesInDb: jest.Mocked<CreateImagesInDbUseCase>;
  let mockImageRepository: jest.Mocked<ImageRepository>;
  let mockCategorizationQueue: jest.Mocked<ImageCategorizationQueue>;
  let mockTransformationQueue: jest.Mocked<ImageTransformationQueue>;
  let mockDetectionQueue: jest.Mocked<ImageDetectionQueue>;

  beforeEach(() => {
    mockReadImagesNames = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ReadImagesNamesUseCase>;

    mockCreateImagesInDb = {
      executeMany: jest.fn(),
    } as unknown as jest.Mocked<CreateImagesInDbUseCase>;

    mockImageRepository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<ImageRepository>;

    mockCategorizationQueue = {
      addBulk: jest.fn(),
    } as unknown as jest.Mocked<ImageCategorizationQueue>;

    mockTransformationQueue = {
      addBulk: jest.fn(),
    } as unknown as jest.Mocked<ImageTransformationQueue>;

    mockDetectionQueue = {
      addBulk: jest.fn(),
    } as unknown as jest.Mocked<ImageDetectionQueue>;

    container.registerInstance(ReadImagesNamesUseCase, mockReadImagesNames);
    container.registerInstance(CreateImagesInDbUseCase, mockCreateImagesInDb);
    container.registerInstance(ImageRepository, mockImageRepository);
    container.registerInstance(INJECTION_TOKENS.IMAGE_CATEGORIZATION_QUEUE, mockCategorizationQueue);
    container.registerInstance(INJECTION_TOKENS.IMAGE_TRANSFORMATION_QUEUE, mockTransformationQueue);
    container.registerInstance(INJECTION_TOKENS.IMAGE_DETECTION_QUEUE, mockDetectionQueue);

    useCase = container.resolve(ProcessImagesUseCase);
  });

  afterEach(() => {
    container.clearInstances();
    jest.clearAllMocks();
  });

  it('should process images in batches', async () => {
    // Arrange
    const mockFiles = ['image1.jpg', 'image2.jpg'];
    const mockImages = [
      {
        id: 1,
        name: 'image1.jpg',
        createdAt: new Date(),
        path: '/path/to/image1.jpg',
        size: 1000,
        width: 100,
        height: 100,
        logs: [],
        categorizations: [],
        transformedImage: null,
        detectedObjects: []
      },
      {
        id: 2,
        name: 'image2.jpg',
        createdAt: new Date(),
        path: '/path/to/image2.jpg',
        size: 1000,
        width: 100,
        height: 100,
        logs: [],
        categorizations: [],
        transformedImage: null,
        detectedObjects: []
      }
    ];

    mockReadImagesNames.execute.mockResolvedValue(mockFiles);
    mockImageRepository.findAll.mockResolvedValue(mockImages);

    // Act
    await useCase.execute();

    // Assert
    expect(mockCreateImagesInDb.executeMany).toHaveBeenCalledWith(mockFiles);
    expect(mockCategorizationQueue.addBulk).toHaveBeenCalled();
    expect(mockTransformationQueue.addBulk).toHaveBeenCalled();
    expect(mockDetectionQueue.addBulk).toHaveBeenCalled();
  });

  it('should return early if no images found', async () => {
    // Arrange
    mockReadImagesNames.execute.mockResolvedValue(null);

    // Act
    await useCase.execute();

    // Assert
    expect(mockCreateImagesInDb.executeMany).not.toHaveBeenCalled();
    expect(mockCategorizationQueue.addBulk).not.toHaveBeenCalled();
    expect(mockTransformationQueue.addBulk).not.toHaveBeenCalled();
    expect(mockDetectionQueue.addBulk).not.toHaveBeenCalled();
  });
});
