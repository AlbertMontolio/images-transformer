import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class ClassificationRepository {
    async createClassifications({ inputs, imageId, }) {
        const classificationsWithImageIds = inputs.map((prediction) => {
            return {
                ...prediction,
                imageId,
            };
        });
        console.log('### classificationsWithImageIds', classificationsWithImageIds);
        await prisma.classification.createMany({
            data: classificationsWithImageIds,
        });
    }
}
// ### TODO: move prisma client creation into a single file, single instance
// ### handle prisma.$disconnect()
//# sourceMappingURL=classification.repository.js.map