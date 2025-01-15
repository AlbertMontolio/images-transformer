import 'reflect-metadata';
import { CreateImagesInDbUseCase } from '../create-images-in-db.use-case';
import { ImageRepository } from '../../../infraestructure/repositories/image.repository';

jest.mock('../../../infraestructure/repositories/image.repository');

describe('CreateImagesInDbUseCase', () => {
  let useCase: CreateImagesInDbUseCase;
  let mockImageRepository: jest.Mocked<ImageRepository>;
  const projectId = 1;

  beforeEach(() => {
    mockImageRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<ImageRepository>;

    useCase = new CreateImagesInDbUseCase();
    useCase.imageRepository = mockImageRepository;
  });

  describe('execute', () => {
    it('should create images one by one', async () => {
      // Arrange
      const imageNames = ['image1.jpg', 'image2.jpg'];
      // TODO: use fixtures
      const mockImages = [
        {
          projectId,
          id: 1,
          name: 'image1.jpg',
          logs: [],
          categorizations: [],
          createdAt: new Date(),
          path: '/path/to/image1.jpg',
          size: 1000,
          width: 100,
          height: 100,
          transformedImage: null,
          detectedObjects: [],
        },
        {
          projectId,
          id: 2,
          name: 'image2.jpg',
          logs: [],
          categorizations: [],
          createdAt: new Date(),
          path: '/path/to/image2.jpg',
          size: 1000,
          width: 100,
          height: 100,
          transformedImage: null,
          detectedObjects: [],
        },
      ];
      mockImageRepository.create.mockImplementation(async (name, pId) => 
        mockImages.find(img => img.name === name)!
      );

      // Act
      const result = await useCase.execute(imageNames, projectId);

      // Assert
      expect(result).toEqual(mockImages);
      expect(mockImageRepository.create).toHaveBeenCalledTimes(2);
      expect(mockImageRepository.create).toHaveBeenCalledWith('image1.jpg', projectId);
      expect(mockImageRepository.create).toHaveBeenCalledWith('image2.jpg', projectId);
    });
  });

  describe('executeMany', () => {
    it('should create multiple images at once', async () => {
      const fileNames = ['image1.jpg', 'image2.jpg'];
      const mockImages = [
        {
          projectId,
          id: 1,
          name: 'image1.jpg',
          logs: [],
          categorizations: [],
          createdAt: new Date(),
          path: '/path/to/image1.jpg',
          size: 1000,
          width: 100,
          height: 100,
          transformedImage: null,
          detectedObjects: [],
        },
        {
          projectId,
          id: 2,
          name: 'image2.jpg',
          logs: [],
          categorizations: [],
          createdAt: new Date(),
          path: '/path/to/image2.jpg',
          size: 1000,
          width: 100,
          height: 100,
          transformedImage: null,
          detectedObjects: [],
        },
      ];
      
      mockImageRepository.createMany.mockResolvedValue(undefined);
      mockImageRepository.findAll.mockResolvedValue(mockImages);

      const result = await useCase.executeMany(fileNames, projectId);

      expect(mockImageRepository.createMany).toHaveBeenCalledWith(fileNames, projectId);
      expect(mockImageRepository.findAll).toHaveBeenCalledWith({
        where: {
          name: { in: fileNames },
          projectId,
        },
      });
      expect(result).toEqual(mockImages);
    });
  });
});