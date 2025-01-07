import { ImageRepository } from "../../infraestructure/repositories/image.repository.js"

export class GetImagesInDbUseCase {
  async execute() {
    const imageRepository = new ImageRepository()
    const images = await imageRepository.findAll()
    console.log('### GetImagesInDbUseCase')
    return images;
  }
}