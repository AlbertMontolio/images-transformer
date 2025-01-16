import { prisma } from '../../prisma/prisma-client';
import { DetectedObjectRepository } from '../detected-object.repository';

jest.mock('../../prisma/prisma-client', () => ({
  prisma: {
    detectedObject: {
      create: jest.fn(),
    },
  },
}));

describe('DetectedObjectRepository', () => {
  let detectedObjectRepository: DetectedObjectRepository;

  beforeEach(() => {
    detectedObjectRepository = new DetectedObjectRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call prisma.detectedObject.create with the correct data', async () => {
      // Arrange
      const input = {
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        class: 'cat',
        score: 0.95,
      };
      const imageId = 1;
      const expectedData = { ...input, imageId };

      // Act
      await detectedObjectRepository.create(input, imageId);

      // Assert
      expect(prisma.detectedObject.create).toHaveBeenCalledTimes(1);
      expect(prisma.detectedObject.create).toHaveBeenCalledWith({
        data: expectedData,
      });
    });

    it('should handle errors gracefully and log them', async () => {
      // Arrange
      const input = {
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        class: 'dog',
        score: 0.85,
      };
      const imageId = 2;
      const mockError = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (prisma.detectedObject.create as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      await detectedObjectRepository.create(input, imageId);

      // Assert
      expect(prisma.detectedObject.create).toHaveBeenCalledTimes(1);
      expect(prisma.detectedObject.create).toHaveBeenCalledWith({
        data: { ...input, imageId },
      });
      expect(consoleSpy).toHaveBeenCalledWith('err', mockError);

      consoleSpy.mockRestore();
    });
  });
});
