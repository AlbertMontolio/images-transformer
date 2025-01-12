import { ProcessImagesUseCase } from "../process-images.use-case";
import { ReadImagesNamesUseCase } from "../read-images-names.use-case";
import { CreateImagesInDbUseCase } from "../create-images-in-db.use-case";
import { createImage } from "./__fixtures__/image.fixture";

jest.mock('ioredis', () => require('ioredis-mock'));
jest.mock('../read-images-names.use-case');
jest.mock('../create-images-in-db.use-case');
jest.mock('../categorize-images.use-case');
jest.mock('../transform-images.use-case');
jest.mock('../detect-objects.use-case');

describe('ProcessImagesUseCase', () => {
  let processImagesUseCase: ProcessImagesUseCase;
  let mockReadImagesNamesUseCase: jest.Mocked<ReadImagesNamesUseCase>;
  let mockCreateImagesInDbUseCase: jest.Mocked<CreateImagesInDbUseCase>;

  beforeEach(() => {
    mockReadImagesNamesUseCase = new ReadImagesNamesUseCase() as jest.Mocked<ReadImagesNamesUseCase>;
    mockCreateImagesInDbUseCase = new CreateImagesInDbUseCase() as jest.Mocked<CreateImagesInDbUseCase>;

    processImagesUseCase = new ProcessImagesUseCase();
    processImagesUseCase.readImagesNamesUseCase = mockReadImagesNamesUseCase;
    processImagesUseCase.createImagesInDbUseCase = mockCreateImagesInDbUseCase;

    jest.clearAllMocks();
  });

  it('should execute all sub-use cases with correct data', async () => {
    // Arrange
    const imageFilesNames = ['image1.jpg', 'image2.png'];
    const images = [
      createImage({ id: 1, name: 'image1.jpg' }),
      createImage({ id: 2, name: 'image2.png' }),
    ];
    mockReadImagesNamesUseCase.execute.mockResolvedValueOnce(imageFilesNames);
    mockCreateImagesInDbUseCase.execute.mockResolvedValueOnce(images);

    // Act
    await processImagesUseCase.execute();

    // Assert
    expect(mockReadImagesNamesUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockCreateImagesInDbUseCase.execute).toHaveBeenCalledWith(imageFilesNames);
  });

  it('should handle no images returned by ReadImagesNamesUseCase', async () => {
    // Arrange
    mockReadImagesNamesUseCase.execute.mockResolvedValueOnce(null);

    // Act
    await processImagesUseCase.execute();

    // Assert
    expect(mockReadImagesNamesUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockCreateImagesInDbUseCase.execute).not.toHaveBeenCalled();
  });
});
