import { PrismaClient } from '@prisma/client';

// TODO: instantiate prisma with a singleton pattern and use it in the app with DI
console.log('PrismaClient instantiated');

// Exported Prisma instance
export const prisma = new PrismaClient();

// Function to retrieve the Prisma client
export const getPrismaClient = (): PrismaClient => prisma;

// Graceful shutdown on SIGINT
process.on('SIGINT', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});
