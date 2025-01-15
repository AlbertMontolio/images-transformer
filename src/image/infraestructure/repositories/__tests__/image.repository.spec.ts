import { prisma } from '../../prisma/prisma-client';
import fs from 'fs/promises';
import sharp from 'sharp';
import { ImageRepository } from '../image.repository';
import path from 'path';
import { hostInputImagesDir, inputImagesDir } from '../../../config';

jest.mock('../../prisma/prisma-client', () => ({
  prisma: {
    image: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    transformedImage: { deleteMany: jest.fn() },
    log: { deleteMany: jest.fn() },
    categorization: { deleteMany: jest.fn() },
    detectedObject: { deleteMany: jest.fn() },
  },
}));

jest.mock('fs/promises');
jest.mock('sharp');

describe('ImageRepository', () => {
  let repository: ImageRepository;
  const imageName = 'test-image.jpg';
  const hostImagePath = path.join(hostInputImagesDir, imageName);
  const imagePath = path.join(inputImagesDir, imageName);
  const projectId = 1;
  beforeEach(() => {
    repository = new ImageRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an image record with logs', async () => {
      // Arrange
      const mockStats = { size: 12345 };
      const mockMetadata = { width: 1920, height: 1080 };
      const mockImageWithLogs = {
        id: 1,
        name: imageName,
        path: hostImagePath,
        size: mockStats.size,
        width: mockMetadata.width,
        height: mockMetadata.height,
        logs: [{ status: 'created' }],
        categorizations: [],
      };

      (fs.stat as jest.Mock).mockResolvedValue(mockStats);
      (sharp as unknown as jest.Mock).mockReturnValue({
        metadata: jest.fn().mockResolvedValue(mockMetadata),
      });
      (prisma.image.upsert as jest.Mock).mockResolvedValue(mockImageWithLogs);

      // Act
      const result = await repository.create(imageName, projectId);

      // Assert
      expect(fs.stat).toHaveBeenCalledWith(imagePath);
      expect(sharp).toHaveBeenCalledWith(imagePath);
      expect(prisma.image.upsert).toHaveBeenCalledWith({
        where: { name: imageName },
        update: {},
        create: {
          projectId,
          name: imageName,
          path: hostImagePath,
          size: mockStats.size,
          width: mockMetadata.width,
          height: mockMetadata.height,
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
    it('should find an image by id with relations', async () => {
      const mockImage = { id: 1, name: imageName };
      (prisma.image.findUnique as jest.Mock).mockResolvedValue(mockImage);

      const result = await repository.findOne(1);

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
    it('should find all images with relations', async () => {
      const mockImages = [{ id: 1, name: imageName }];
      (prisma.image.findMany as jest.Mock).mockResolvedValue(mockImages);

      const result = await repository.findAll();

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
    it('should delete all records from all tables', async () => {
      await repository.deleteAllImagesAndRelations();

      expect(prisma.transformedImage.deleteMany).toHaveBeenCalled();
      expect(prisma.log.deleteMany).toHaveBeenCalled();
      expect(prisma.categorization.deleteMany).toHaveBeenCalled();
      expect(prisma.detectedObject.deleteMany).toHaveBeenCalled();
      expect(prisma.image.deleteMany).toHaveBeenCalled();
    });
  });
});
