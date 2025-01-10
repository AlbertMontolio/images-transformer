import { LogRepository } from "../log.repository";
import { prisma } from "../../prisma/prisma-client";

jest.mock('../../prisma/prisma-client', () => ({
  prisma: {
    log: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('LogRepository', () => {
  let logRepository: LogRepository;

  beforeEach(() => {
    logRepository = new LogRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a log with the correct data', async () => {
      // Arrange
      const logData = { imageId: 1, status: 'created' };

      // Act
      await logRepository.create(logData);

      // Assert
      expect(prisma.log.create).toHaveBeenCalledTimes(1);
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: logData,
      });
    });

    it('should handle errors gracefully and log them', async () => {
      // Arrange
      const logData = { imageId: 1, status: 'created' };
      const mockError = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (prisma.log.create as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      await logRepository.create(logData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('### err:', mockError);
      consoleSpy.mockRestore();
    });
  });

  describe('findLogByImageIdAndStatus', () => {
    it('should return the log when found', async () => {
      // Arrange
      const queryData = { imageId: 1, status: 'created' };
      const mockLog = { id: 1, imageId: 1, status: 'created' };
      (prisma.log.findFirst as jest.Mock).mockResolvedValueOnce(mockLog);

      // Act
      const result = await logRepository.findLogByImageIdAndStatus(queryData);

      // Assert
      expect(prisma.log.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.log.findFirst).toHaveBeenCalledWith({
        where: queryData,
      });
      expect(result).toEqual(mockLog);
    });

    it('should return null when no log is found', async () => {
      // Arrange
      const queryData = { imageId: 1, status: 'created' };
      (prisma.log.findFirst as jest.Mock).mockResolvedValueOnce(null);

      // Act
      const result = await logRepository.findLogByImageIdAndStatus(queryData);

      // Assert
      expect(prisma.log.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.log.findFirst).toHaveBeenCalledWith({
        where: queryData,
      });
      expect(result).toBeNull();
    });
  });

  describe('updateLogById', () => {
    it('should update the log with the correct data', async () => {
      // Arrange
      const updateData = { logId: 1, status: 'completed', finishedAt: new Date() };

      // Act
      await logRepository.updateLogById(updateData);

      // Assert
      expect(prisma.log.update).toHaveBeenCalledTimes(1);
      expect(prisma.log.update).toHaveBeenCalledWith({
        where: { id: updateData.logId },
        data: { finishedAt: updateData.finishedAt },
      });
    });

    it('should handle errors gracefully when update fails', async () => {
      // Arrange
      const updateData = { logId: 1, status: 'completed', finishedAt: new Date() };
      const mockError = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      (prisma.log.update as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      await logRepository.updateLogById(updateData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('### err:', mockError);
      consoleSpy.mockRestore();
    });
  });
});
