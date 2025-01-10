import { Categorization } from "@prisma/client";
import { prisma } from "../prisma/prisma-client";

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
