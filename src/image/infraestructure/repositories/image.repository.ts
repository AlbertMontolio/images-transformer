import { prisma } from '../prisma/prisma-client'
import fs from 'fs/promises';
import sharp from 'sharp';
import path from 'path';
import { hostInputImagesDir, inputImagesDir } from '../../config';

export class ImageRepository {
  async create(imageName: string) {
    const hostImagePath = path.join(hostInputImagesDir, imageName);
    const imagePath = path.join(inputImagesDir, imageName);

    const stats = await fs.stat(imagePath);

    const metadata = await sharp(imagePath).metadata();

    const imageWithLogs = await prisma.image.upsert({
      where: { name: imageName }, // Unique constraint field
      update: {}, // Leave the existing record unchanged
      create: {
        name: imageName,
        path: hostImagePath,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
      },
    });

    return imageWithLogs;
  }

  async findOne(id: number) {
    return await prisma.image.findUnique({
      where:{ id },
      include: {
        transformedImage: true,
        logs: true,
        categorizations: true,
        detectedObjects: true,
      }
    })
  }

  async findAll() {
    const images = await prisma.image.findMany({
      include: {
        transformedImage: true,
        logs: true,
        categorizations: true,
        detectedObjects: true,
      }
    });
    return images;
  }

  async getStats() {
    const images = await this.findAll();
    return images.length;
  }

  async deleteAllImagesAndRelations() {
    // only for prototyping
    try {
      // Delete child tables first to avoid foreign key constraints
      await prisma.transformedImage.deleteMany({});
      await prisma.log.deleteMany({});
      await prisma.categorization.deleteMany({});
      await prisma.detectedObject.deleteMany({});
  
      // Delete parent table
      await prisma.image.deleteMany({});
  
      console.log('All rows from all tables have been deleted.');
    } catch (error) {
      console.error('Error deleting rows:', error);
    }
  }
}
