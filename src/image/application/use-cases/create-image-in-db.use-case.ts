import { ImageRepository } from "../../infraestructure/repositories/image.repository.js"
import { LogRepository } from "../../infraestructure/repositories/log.repository.js"

export class CreateImageInDbUseCase {
  async execute(imagePath: string): Promise<number> {
    const imageRepository = new ImageRepository()
    const imageWithLogs = await imageRepository.createImage(imagePath)

    const imageId = imageWithLogs.id;

    console.log('### image created')

    return imageId;
  }
}
