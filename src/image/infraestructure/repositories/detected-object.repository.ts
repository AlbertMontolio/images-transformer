import { prisma } from '../prisma/prisma-client'

type DetectedObjectCreateInput = {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  score: number;
}

export class DetectedObjectRepository {
  async create(input: DetectedObjectCreateInput, imageId: number) {
    const inputWithImageId = {
      ...input,
      imageId,
    }

    console.log('### inputWithImageId', inputWithImageId)
    try {
      await prisma.detectedObject.create({
        data: inputWithImageId,
      })
    } catch (err) {
      console.log('### err', err)
    }
  }
}
