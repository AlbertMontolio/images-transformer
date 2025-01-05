import { PrismaClient, Classification } from '@prisma/client';

const prisma = new PrismaClient();

export type CreateClassificationProp = Pick<Classification, 'label' | 'score'>

export class ClassificationRepository {
  async createClassifications({
    inputs,
    imageId,
  }: {
    inputs: CreateClassificationProp[];
    imageId: number;
  }) {
    const classificationsWithImageIds = inputs.map((prediction) => {
      return {
        ...prediction,
        imageId,
      }
    })

    console.log('### classificationsWithImageIds', classificationsWithImageIds);
    await prisma.classification.createMany({
      data: classificationsWithImageIds,
    })
  }
}

// ### TODO: move prisma client creation into a single file, single instance
// ### handle prisma.$disconnect()