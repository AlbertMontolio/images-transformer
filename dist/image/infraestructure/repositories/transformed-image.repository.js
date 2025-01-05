import { prisma } from '../prisma/prisma-client.js';
export class TransformedImageRepository {
    async create({ path, imageId, }) {
        console.log('### 2 imageId', imageId);
        try {
            const transformedImage = await prisma.transformedImage.create({
                data: {
                    path,
                    imageId,
                }
            });
            return transformedImage;
        }
        catch (err) {
            console.log('### TransformedImageRepository#create err: ', err);
            return null;
        }
    }
    async update({ input, transformedId, }) {
        await prisma.transformedImage.update({
            where: {
                id: transformedId,
            },
            data: {
                ...input
            }
        });
    }
    async findAll() {
        return await prisma.transformedImage.findMany();
    }
}
//# sourceMappingURL=transformed-image.repository.js.map