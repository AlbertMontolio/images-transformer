import { ImageRepository } from "../../infraestructure/repositories/image.repository.js";
export class GetImagesInDbUseCase {
    async execute() {
        const imageRepository = new ImageRepository();
        const images = await imageRepository.fetchImages();
        console.log('### GetImagesInDbUseCase');
        return images;
    }
}
//# sourceMappingURL=get-images-in-db.use-case.js.map