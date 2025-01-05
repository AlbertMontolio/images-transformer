import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class CategorizationRepository {
    async createMany({ inputs, imageId, }) {
        const categorizationsWithImageIds = inputs.map((prediction) => {
            return {
                ...prediction,
                imageId,
            };
        });
        await prisma.categorization.createMany({
            data: categorizationsWithImageIds,
        });
    }
}
// ### TODO: move prisma client creation into a single file, single instance
// ### handle prisma.$disconnect()
//# sourceMappingURL=categorization.repository.js.map