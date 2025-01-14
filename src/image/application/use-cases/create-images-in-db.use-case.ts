import { Image } from "@prisma/client";
import { ImageRepository } from "../../infraestructure/repositories/image.repository"
import { injectable } from 'tsyringe';

@injectable()
export class CreateImagesInDbUseCase {
  imageRepository: ImageRepository;

  constructor() {
    this.imageRepository = new ImageRepository()
  }
  async execute(imageNames: string[]): Promise<Image[]> {
    const images: Image[] = []; 
    for (const imageName of imageNames) {
      const image = await this.imageRepository.create(imageName)
      images.push(image)
    }

    return images;
  }

  async executeMany(fileNames: string[]): Promise<Image[]> {
    await this.imageRepository.createMany(fileNames);

    // Fetch the inserted records
    return await this.imageRepository.findAll({
      where: {
        name: { in: fileNames },
      },
    });
  }
}
