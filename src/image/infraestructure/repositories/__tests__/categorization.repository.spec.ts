import { prisma } from "../../prisma/prisma-client";
import { CategorizationRepository, CreateCategorizationProp } from "../categorization.repository";

jest.mock('../../prisma/prisma-client', () => ({
  prisma: {
    categorization: {
      createMany: jest.fn(),
    },
  },
}));

describe('CategorizationRepository', () => {
  let categorizationRepository: CategorizationRepository;

  beforeEach(() => {
    categorizationRepository = new CategorizationRepository();
    jest.clearAllMocks();
  });

  describe('createMany', () => {
    it('should call prisma.categorization.createMany with correct data', async () => {
      // Arrange
      const inputs: CreateCategorizationProp[] = [
        { label: 'cat', score: 0.95 },
        { label: 'dog', score: 0.85 },
      ];
      const imageId = 1;
      const expectedData = inputs.map(input => ({
        ...input,
        imageId,
      }));

      // Act
      await categorizationRepository.createMany({ inputs, imageId });

      // Assert
      expect(prisma.categorization.createMany).toHaveBeenCalledTimes(1);
      expect(prisma.categorization.createMany).toHaveBeenCalledWith({
        data: expectedData,
      });
    });

    it('should handle an empty inputs array', async () => {
      // Arrange
      const inputs: CreateCategorizationProp[] = [];
      const imageId = 1;

      // Act
      await categorizationRepository.createMany({ inputs, imageId });

      // Assert
      expect(prisma.categorization.createMany).toHaveBeenCalledTimes(1);
      expect(prisma.categorization.createMany).toHaveBeenCalledWith({
        data: [],
      });
    });

    it('should throw an error if prisma.categorization.createMany fails', async () => {
      // Arrange
      const inputs: CreateCategorizationProp[] = [
        { label: 'cat', score: 0.95 },
      ];
      const imageId = 1;
      const mockError = new Error('Database error');
      (prisma.categorization.createMany as jest.Mock).mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(categorizationRepository.createMany({ inputs, imageId })).rejects.toThrow(
        'Database error',
      );
      expect(prisma.categorization.createMany).toHaveBeenCalledTimes(1);
    });
  });
});
