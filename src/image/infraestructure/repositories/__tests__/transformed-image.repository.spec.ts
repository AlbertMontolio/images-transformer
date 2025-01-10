import { TransformedImageRepository } from '../transformed-image.repository';
import { prisma } from '../../prisma/prisma-client';

jest.mock('../../prisma/prisma-client', () => ({
  prisma: {
    transformedImage: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('TransformedImageRepository', () => {
  let transformedImageRepository: TransformedImageRepository;

  beforeEach(() => {
    transformedImageRepository = new TransformedImageRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transformed image record', async () => {
      // Arrange
      const imageId = 1;
      const path = '/path/to/image.jpg';
      const mockTransformedImage = { id: 1, path, imageId };
      (prisma.transformedImage.create as jest.Mock).mockResolvedValueOnce(mockTransformedImage);

      // Act
      const result = await transformedImageRepository.create({ path, imageId });

      // Assert
      expect(prisma.transformedImage.create).toHaveBeenCalledTimes(1);
      expect(prisma.transformedImage.create).toHaveBeenCalledWith({
        data: { path, imageId },
      });
      expect(result).toEqual(mockTransformedImage);
    });

    it('should handle errors gracefully and return null', async () => {
      // Arrange
      const imageId = 1;
      const path = '/path/to/image.jpg';
      const mockError = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (prisma.transformedImage.create as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      const result = await transformedImageRepository.create({ path, imageId });

      // Assert
      expect(prisma.transformedImage.create).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        '### TransformedImageRepository#create err: ',
        mockError
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('update', () => {
    it('should update a transformed image record', async () => {
      // Arrange
      const transformedId = 1;
      const input = { width: 1920, height: 1080, watermarkText: 'Sample' };
  
      // Act
      await transformedImageRepository.update({ input, transformedId });
  
      // Assert
      expect(prisma.transformedImage.update).toHaveBeenCalledTimes(1);
      expect(prisma.transformedImage.update).toHaveBeenCalledWith({
        where: { id: transformedId },
        data: { ...input },
      });
    });
  
    it('should handle errors gracefully when update fails', async () => {
      // Arrange
      const transformedId = 1;
      const input = { width: 1920, height: 1080 };
      const mockError = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (prisma.transformedImage.update as jest.Mock).mockRejectedValueOnce(mockError);
  
      // Act
      await transformedImageRepository.update({ input, transformedId });
  
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        '### TransformedImageRepository#update err: ',
        mockError
      );
  
      consoleSpy.mockRestore();
    });
  });

  describe('findAll', () => {
    it('should return all transformed image records', async () => {
      // Arrange
      const mockTransformedImages = [
        { id: 1, path: '/path/to/image1.jpg', imageId: 1 },
        { id: 2, path: '/path/to/image2.jpg', imageId: 2 },
      ];
      (prisma.transformedImage.findMany as jest.Mock).mockResolvedValueOnce(mockTransformedImages);

      // Act
      const result = await transformedImageRepository.findAll();

      // Assert
      expect(prisma.transformedImage.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTransformedImages);
    });

    it('should return an empty array when no records exist', async () => {
      // Arrange
      (prisma.transformedImage.findMany as jest.Mock).mockResolvedValueOnce([]);

      // Act
      const result = await transformedImageRepository.findAll();

      // Assert
      expect(prisma.transformedImage.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });
});
