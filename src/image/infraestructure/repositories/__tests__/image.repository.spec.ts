import { ImageRepository } from '../image.repository';
import { prisma } from '../../prisma/prisma-client';
import fs from 'fs/promises';
import sharp from 'sharp';

jest.mock('../../prisma/prisma-client', () => ({
  prisma: {
    image: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    transformedImage: {
      deleteMany: jest.fn(),
    },
    log: {
      deleteMany: jest.fn(),
    },
    categorization: {
      deleteMany: jest.fn(),
    },
    detectedObject: {
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('fs/promises', () => ({
  stat: jest.fn(),
}));

jest.mock('sharp', () => jest.fn(() => ({
  metadata: jest.fn(),
})));

describe('ImageRepository', () => {
  let imageRepository: ImageRepository;

  beforeEach(() => {
    imageRepository = new ImageRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an image record with logs', async () => {
      // Arrange
      const imageName = 'test-image.jpg';
      const statsMock = { size: 12345 };
      const metadataMock = { width: 1920, height: 1080 };
      const mockImageWithLogs = { id: 1, name: imageName, logs: [], categorizations: [] };

      (fs.stat as jest.Mock).mockResolvedValueOnce(statsMock);
      (sharp as unknown as jest.Mock).mockReturnValueOnce({
        metadata: jest.fn().mockResolvedValueOnce(metadataMock),
      });
      (prisma.image.upsert as jest.Mock).mockResolvedValueOnce(mockImageWithLogs);

      // Act
      const result = await imageRepository.create(imageName);

      // Assert
      expect(fs.stat).toHaveBeenCalledWith(expect.stringContaining(imageName));
      expect(sharp).toHaveBeenCalledWith(expect.stringContaining(imageName));
      expect(prisma.image.upsert).toHaveBeenCalledWith({
        where: { name: imageName },
        update: {},
        create: {
          name: imageName,
          path: expect.stringContaining(imageName),
          size: statsMock.size,
          width: metadataMock.width,
          height: metadataMock.height,
          logs: { create: { status: 'created' } },
        },
        include: {
          logs: true,
          categorizations: true,
        },
      });
      expect(result).toEqual(mockImageWithLogs);
    });
  });

  describe('findOne', () => {
    it('should find a single image by ID', async () => {
      // Arrange
      const mockImage = { id: 1, name: 'test-image.jpg', logs: [] };
      (prisma.image.findUnique as jest.Mock).mockResolvedValueOnce(mockImage);

      // Act
      const result = await imageRepository.findOne(1);

      // Assert
      expect(prisma.image.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          transformedImage: true,
          logs: true,
          categorizations: true,
          detectedObjects: true,
        },
      });
      expect(result).toEqual(mockImage);
    });
  });

  describe('findAll', () => {
    it('should return all images', async () => {
      // Arrange
      const mockImages = [{ id: 1, name: 'image1.jpg' }, { id: 2, name: 'image2.png' }];
      (prisma.image.findMany as jest.Mock).mockResolvedValueOnce(mockImages);

      // Act
      const result = await imageRepository.findAll();

      // Assert
      expect(prisma.image.findMany).toHaveBeenCalledWith({
        include: {
          transformedImage: true,
          logs: true,
          categorizations: true,
          detectedObjects: true,
        },
      });
      expect(result).toEqual(mockImages);
    });
  });

  describe('deleteAllImagesAndRelations', () => {
    it('should delete all images and their related data', async () => {
      // Arrange
      (prisma.transformedImage.deleteMany as jest.Mock).mockResolvedValueOnce({});
      (prisma.log.deleteMany as jest.Mock).mockResolvedValueOnce({});
      (prisma.categorization.deleteMany as jest.Mock).mockResolvedValueOnce({});
      (prisma.detectedObject.deleteMany as jest.Mock).mockResolvedValueOnce({});
      (prisma.image.deleteMany as jest.Mock).mockResolvedValueOnce({});

      // Act
      await imageRepository.deleteAllImagesAndRelations();

      // Assert
      expect(prisma.transformedImage.deleteMany).toHaveBeenCalledTimes(1);
      expect(prisma.log.deleteMany).toHaveBeenCalledTimes(1);
      expect(prisma.categorization.deleteMany).toHaveBeenCalledTimes(1);
      expect(prisma.detectedObject.deleteMany).toHaveBeenCalledTimes(1);
      expect(prisma.image.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('should log an error if deletion fails', async () => {
      // Arrange
      const mockError = new Error('Deletion error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (prisma.image.deleteMany as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      await imageRepository.deleteAllImagesAndRelations();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting rows:', mockError);
      consoleSpy.mockRestore();
    });
  });
});
