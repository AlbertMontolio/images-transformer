import { PrismaClient } from '@prisma/client';

console.log('### PrismaClient instantiated')
export const prisma = new PrismaClient();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

