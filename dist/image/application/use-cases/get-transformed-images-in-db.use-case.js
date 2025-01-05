import { TransformedImageRepository } from "../../infraestructure/repositories/transformed-image.repository.js";
export class GetTransformedImagesInDbUseCase {
    async execute() {
        const transformedImageRepository = new TransformedImageRepository();
        const transformedImages = await transformedImageRepository.findAll();
        return transformedImages;
    }
}
//# sourceMappingURL=get-transformed-images-in-db.use-case.js.map