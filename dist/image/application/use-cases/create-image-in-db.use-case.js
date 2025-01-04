import { ImageRepository } from "../../infraestructure/repositories/image.repository.js";
export class CreateImageInDbUseCase {
    async execute(imagePath) {
        const imageRepository = new ImageRepository();
        const imageWithLogs = await imageRepository.createImage(imagePath);
        const imageId = imageWithLogs.id;
        console.log('### image created');
        return imageId;
    }
}
//# sourceMappingURL=create-image-in-db.use-case.js.map