import { ImageRepository } from "../../infraestructure/repositories/image.repository.js";
export class CreateImagesInDbUseCase {
    imageRepository;
    constructor() {
        this.imageRepository = new ImageRepository();
    }
    async execute(imagesPaths) {
        const images = [];
        for (const imagePath of imagesPaths) {
            const image = await this.imageRepository.createImage(imagePath);
            images.push(image);
        }
        return images;
    }
}
//# sourceMappingURL=create-images-in-db.use-case.js.map