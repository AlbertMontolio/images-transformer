import { container } from '../../../../shared/container';
import { ProcessImagesUseCase } from '../process-images.use-case';
import { ReadImagesNamesUseCase } from '../read-images-names.use-case';
import { CreateImagesInDbUseCase } from '../create-images-in-db.use-case';
import { INJECTION_TOKENS } from '../../../../shared/injection-tokens';

describe('ProcessImagesUseCase', () => {
  let processImagesUseCase: ProcessImagesUseCase;
  const mockReadImagesNamesUseCase = { 
    execute: jest.fn() as jest.Mock<Promise<string[] | null>>
  } as unknown as ReadImagesNamesUseCase;
  const mockCreateImagesInDbUseCase = { 
    execute: jest.fn() as jest.Mock<Promise<any>>
  } as unknown as CreateImagesInDbUseCase;
  const mockImageCategorizationQueue = { add: jest.fn() };
  const mockImageTransformationQueue = { add: jest.fn() };
  const mockImageDetectionQueue = { add: jest.fn() };

  beforeEach(() => {
    // Register mocks
    container.registerInstance(ReadImagesNamesUseCase, mockReadImagesNamesUseCase);
    container.registerInstance(CreateImagesInDbUseCase, mockCreateImagesInDbUseCase);
    container.register(INJECTION_TOKENS.IMAGE_CATEGORIZATION_QUEUE, { useValue: mockImageCategorizationQueue });
    container.register(INJECTION_TOKENS.IMAGE_TRANSFORMATION_QUEUE, { useValue: mockImageTransformationQueue });
    container.register(INJECTION_TOKENS.IMAGE_DETECTION_QUEUE, { useValue: mockImageDetectionQueue });

    processImagesUseCase = container.resolve(ProcessImagesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process images successfully', async () => {
    const mockImageNames = ['image1.jpg', 'image2.jpg'];
    const mockImages = [
      { id: 1, name: 'image1.jpg' },
      { id: 2, name: 'image2.jpg' }
    ];

    // mockReadImagesNamesUseCase.execute.mockResolvedValue(mockImageNames);
    // mockCreateImagesInDbUseCase.execute.mockResolvedValue(mockImages);

    await processImagesUseCase.execute();

    expect(mockReadImagesNamesUseCase.execute).toHaveBeenCalled();
    expect(mockCreateImagesInDbUseCase.execute).toHaveBeenCalledWith(mockImageNames);
    expect(mockImageTransformationQueue.add).toHaveBeenCalledTimes(2);
    expect(mockImageCategorizationQueue.add).toHaveBeenCalledTimes(2);
    expect(mockImageDetectionQueue.add).toHaveBeenCalledTimes(2);
  });

  it('should do nothing if no images found', async () => {
    // mockReadImagesNamesUseCase.execute.mockResolvedValue(null);

    await processImagesUseCase.execute();

    expect(mockCreateImagesInDbUseCase.execute).not.toHaveBeenCalled();
    expect(mockImageTransformationQueue.add).not.toHaveBeenCalled();
    expect(mockImageCategorizationQueue.add).not.toHaveBeenCalled();
    expect(mockImageDetectionQueue.add).not.toHaveBeenCalled();
  });
});
