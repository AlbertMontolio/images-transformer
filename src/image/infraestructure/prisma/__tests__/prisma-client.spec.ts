import { prisma, getPrismaClient } from '../prisma-client';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = jest.fn().mockImplementation(() => ({
    $disconnect: jest.fn(),
  }));
  return { PrismaClient: mockPrismaClient };
});

describe('PrismaClient Initialization', () => {
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExit = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });


  it('should retrieve the Prisma client using getPrismaClient', () => {
    // Act
    const client = getPrismaClient();

    // Assert
    expect(client).toBe(prisma); // Ensure getPrismaClient returns the exported prisma instance
  });

  it('should handle SIGINT event and call prisma.$disconnect', async () => {
    // Arrange
    const mockDisconnect = prisma.$disconnect as jest.Mock;
    const signalHandler = process.listeners('SIGINT')[0] as (signal: NodeJS.Signals) => Promise<void>;

    // Act
    await signalHandler('SIGINT'); // Simulate SIGINT event

    // Assert
    expect(mockDisconnect).toHaveBeenCalledTimes(1); // Ensure $disconnect was called
    expect(mockExit).toHaveBeenCalledWith(0); // Ensure process.exit was called with 0
  });
});
