import { PrismaClient, Categorization } from '@prisma/client';

const prisma = new PrismaClient();

export type CreateCategorizationProp = Pick<Categorization, 'label' | 'score'>

export class CategorizationRepository {
  async createMany({
    inputs,
    imageId,
  }: {
    inputs: CreateCategorizationProp[];
    imageId: number;
  }) {
    const categorizationsWithImageIds = inputs.map((prediction) => {
      return {
        ...prediction,
        imageId,
      }
    })

    await prisma.categorization.createMany({
      data: categorizationsWithImageIds,
    })
  }
}

// ### TODO: move prisma client creation into a single file, single instance
// ### handle prisma.$disconnect()