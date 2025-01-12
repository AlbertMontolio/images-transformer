import sharp from 'sharp';
import { TransformImageService } from '../transform-image.service';
import { TransformedImageRepository } from '../../repositories/transformed-image.repository';
import { FilterSelectorService } from '../../../domain/services/filter-selector.service';
import path from 'path';
import { outputImagesDir } from '../../../config';

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

  const mockImage = {
    name: 'test.jpg',
    id: 1,
    createdAt: new Date(),
    width: 1000,
    height: 400,
    size: 100,
    path: 'input/path',
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<TransformedImageRepository>;

    mockFilterSelector = {
      getRandomFilter: jest.fn(),
    } as unknown as jest.Mocked<FilterSelectorService>;

    service = new TransformImageService();
    service.transformedImageRepository = mockRepository;
    service.filterSelectorService = mockFilterSelector;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should apply transformations and return the sharp instance', async () => {
    // Arrange
    const mockSharpInstance = {
      resize: jest.fn().mockReturnThis(),
      metadata: jest.fn().mockResolvedValue({ width: 2000, height: 1000 }),
      composite: jest.fn().mockReturnThis(),
      withMetadata: jest.fn().mockReturnThis(),
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
    const result = await service.execute({
      image: mockImage,
      watermarkText: 'Sample Watermark',
    });

    // Assert
    expect(result).toBe(mockSharpInstance);
    expect(mockSharpInstance.resize).toHaveBeenCalledWith(1000);
    expect(mockFilter.applyFilter).toHaveBeenCalledWith(mockSharpInstance);
    expect(mockSharpInstance.composite).toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledTimes(2);
    expect(mockRepository.update).toHaveBeenNthCalledWith(1, {
      input: {
        filterType: 'blur',
        filterValue: '2',
      },
      transformedId: transformedImage.id,
    });
  });

  it('should handle sharp errors gracefully', async () => {
    // Arrange
    const error = new Error('Sharp error');
    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => {
      throw error;
    });
    mockRepository.create.mockResolvedValueOnce(transformedImage);

    // Act
    const result = await service.execute({
      image: mockImage,
      watermarkText: 'Sample Watermark',
    });

    // Assert
    expect(result).toBeUndefined();
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository creation failure', async () => {
    // Arrange
    mockRepository.create.mockResolvedValueOnce(null);

    // Act
    const result = await service.execute({
      image: mockImage,
      watermarkText: 'Sample Watermark',
    });

    // Assert
    expect(result).toBeUndefined();
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
