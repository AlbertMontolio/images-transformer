import { ImageRepository } from "../../infraestructure/repositories/image.repository"

export class CreateImagesInDbUseCase {
  imageRepository: ImageRepository;

  constructor() {
    this.imageRepository = new ImageRepository()
  }
  async execute(imageNames: string[]) {
    const images = []; 
    console.log('### ciiduc imageNames', imageNames)
    for (const imageName of imageNames) {
      const image = await this.imageRepository.create(imageName)
      images.push(image)
    }

    return images;
  }
}
