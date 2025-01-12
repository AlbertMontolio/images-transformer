import sharp from 'sharp';
import { TransformImageService } from '../transform-image.service';
import { TransformedImageRepository } from '../../repositories/transformed-image.repository';
import { FilterSelectorService } from '../../../domain/services/filter-selector.service';

type FilterOption = {
  name: string;
  applyFilter: jest.Mock;
  value?: unknown;
};

jest.mock('sharp');
jest.mock('../../repositories/transformed-image.repository');
jest.mock('../../../domain/services/filter-selector.service');

describe('TransformImageService', () => {
  let service: TransformImageService;
  let mockRepository: jest.Mocked<TransformedImageRepository>;
  let mockFilterSelector: jest.Mocked<FilterSelectorService>;

  const transformedImage = {
    id: 1,
    path: 'output/path',
    imageId: 1,
    createdAt: new Date(),
    width: 1000,
    height: 400,
    size: 100,
    name: 'foo-name',
    watermarkText: 'foo-watermark',
    filterType: 'blur',
    filterValue: '3',
  };

  beforeEach(() => {
    mockRepository = new TransformedImageRepository() as jest.Mocked<TransformedImageRepository>;
    mockFilterSelector = new FilterSelectorService() as jest.Mocked<FilterSelectorService>;
    service = new TransformImageService();
    service.transformedImageRepository = mockRepository;
    service.filterSelectorService = mockFilterSelector;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should apply transformations and update the repository', async () => {
    // Arrange
    const mockSharpInstance = {
      resize: jest.fn().mockReturnThis(),
      metadata: jest.fn().mockResolvedValue({ width: 2000, height: 1000 }),
      composite: jest.fn().mockReturnThis(),
      withMetadata: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue(undefined),
    };

    const mockFilter: FilterOption = {
      name: 'blur',
      applyFilter: jest.fn(),
      value: 2,
    };

    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => mockSharpInstance as any);
    mockRepository.create.mockResolvedValueOnce(transformedImage);
    mockRepository.update.mockResolvedValueOnce(undefined);
    mockFilterSelector.getRandomFilter.mockReturnValueOnce(mockFilter);

    // Act
    await service.execute({
      image: {
        name: 'test.jpg',
        id: 1,
        createdAt: new Date(),
        width: 1000,
        height: 400,
        size: 100,
        path: 'input/path',
      },
      watermarkText: 'Sample Watermark',
    });

    // Assert
    expect(mockSharpInstance.resize).toHaveBeenCalledWith(1000);
    expect(mockFilter.applyFilter).toHaveBeenCalledWith(mockSharpInstance);
    expect(mockSharpInstance.composite).toHaveBeenCalled();
    expect(mockSharpInstance.toFile).toHaveBeenCalledWith(expect.stringContaining('transformed_images'));
    expect(mockRepository.update).toHaveBeenCalledTimes(2);
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const error = new Error('Sharp error');
    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => {
      throw error;
    });
    mockRepository.create.mockResolvedValueOnce(transformedImage);

    // Act & Assert
    await expect(
      service.execute({
        image: {
          name: 'test.jpg',
          id: 1,
          createdAt: new Date(),
          width: 1000,
          height: 400,
          size: 100,
          path: 'input/path',
        },
        watermarkText: 'Sample Watermark',
      }),
    ).resolves.toBeUndefined();
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should log an error if transformedImage creation fails', async () => {
    // Arrange
    mockRepository.create.mockResolvedValueOnce(null);

    // Act
    await service.execute({
      image: {
        name: 'test.jpg',
        id: 1,
        createdAt: new Date(),
        width: 1000,
        height: 400,
        size: 100,
        path: 'input/path',
      },
      watermarkText: 'Sample Watermark',
    });

    // Assert
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
