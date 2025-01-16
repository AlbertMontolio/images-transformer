import { TransformedImage } from '@prisma/client';
import { prisma } from '../prisma/prisma-client'

type InputUpdate = {
  width?: number;
  height?: number;
  size?: number;
  watermarkText?: string;
  filterType?: string;
  filterValue?: string;
  writtenAt?: Date;
}

export class TransformedImageRepository {
  async create({
    path,
    imageId,
  }: {
    path: string;
    imageId: number;
  }): Promise<TransformedImage> {
    try {
      const transformedImage = await prisma.transformedImage.create({
        data: {
          path,
          imageId,
        }
      })

      return transformedImage;
    } catch (err) {
      console.log('err: ', err)
      return null;
    }
  }

  async update({
    input,
    transformedId,
  }: {
    input: InputUpdate;
    transformedId: number;
  }): Promise<void> {
    try {
      await prisma.transformedImage.update({
        where: {
          id: transformedId,
        },
        data: {
          ...input,
        },
      });
    } catch (err) {
      console.log('err: ', err);
    }
  }

  async findAll(): Promise<TransformedImage[]> {
    return await prisma.transformedImage.findMany();
  }

  async updateMany(imageIds: number[], data: InputUpdate): Promise<void> {
    try {
      await prisma.transformedImage.updateMany({
        where: {
          imageId: {
            in: imageIds
          }
        },
        data: {
          ...data,
        }
      });
    } catch (err) {
      console.log('err: ', err);
      throw err;
    }
  }
}