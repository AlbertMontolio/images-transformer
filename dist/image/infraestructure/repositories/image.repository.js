import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class ImageRepository {
    async createImage(imagePath) {
        console.log('### creating image...');
        const imageWithLogs = await prisma.image.upsert({
            where: { path: imagePath }, // Unique constraint field
            update: {}, // Leave the existing record unchanged
            create: {
                path: imagePath,
                logs: {
                    create: {
                        status: 'created',
                    },
                },
            },
            include: {
                logs: true,
            },
        });
        return imageWithLogs;
    }
    async fetchImages() {
        const images = await prisma.image.findMany({
            include: {
                logs: true,
            }
        });
        return images;
    }
}
// ### TODO: move prisma client creation into a single file, single instance
// ### handle prisma.$disconnect()
//# sourceMappingURL=image.repository.js.map