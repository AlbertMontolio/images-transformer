import { ImageRepository } from "../../infraestructure/repositories/image.repository.js"
import { LogRepository } from "../../infraestructure/repositories/log.repository.js"

export class CreateImagesInDbUseCase {
  imageRepository: ImageRepository;

  constructor() {
    this.imageRepository = new ImageRepository()
  }
  async execute(imagesPaths: string[]) {
    const images = []; 
    for (const imagePath of imagesPaths) {
      const image = await this.imageRepository.create(imagePath)
      images.push(image)
    }

    return images;
  }
}
