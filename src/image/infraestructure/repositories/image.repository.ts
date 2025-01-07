import { prisma } from '../prisma/prisma-client.js'
import fs from 'fs/promises';
import sharp from 'sharp';
import path from 'path';

export class ImageRepository {
  async create(imagePath: string) {
    console.log('### creating image...')
    const stats = await fs.stat(imagePath);

    const metadata = await sharp(imagePath).metadata();
    const imageName = path.basename(imagePath);

    const imageWithLogs = await prisma.image.upsert({
      where: { path: imagePath }, // Unique constraint field
      update: {}, // Leave the existing record unchanged
      create: {
        name: imageName,
        path: imagePath,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        logs: {
          create: {
            status: 'created',
          },
        },
      },
      include: {
        logs: true,
        categorizations: true,
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
}

// ### TODO: move prisma client creation into a single file, single instance
// ### handle prisma.$disconnect()