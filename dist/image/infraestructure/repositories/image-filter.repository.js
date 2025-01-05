import { prisma } from "../prisma/prisma-client.js";
export class ImageFilterRepository {
    async createImageFilter({ type, value, transformedImageId, }) {
        console.log('### creating image filter...');
        try {
            await prisma.imageFilter.create({
                data: {
                    type,
                    value,
                    transformedImageId,
                }
            });
        }
        catch (err) {
            console.log('### error on creating imageFilter::', err);
        }
    }
}
//# sourceMappingURL=image-filter.repository.js.map