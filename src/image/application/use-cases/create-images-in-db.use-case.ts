import { Image } from "@prisma/client";
import { ImageRepository } from "../../infraestructure/repositories/image.repository"
import { injectable } from 'tsyringe';

@injectable()
export class CreateImagesInDbUseCase {
  imageRepository: ImageRepository;

  constructor() {
    this.imageRepository = new ImageRepository()
  }
  async execute(imageNames: string[], projectId: number): Promise<Image[]> {
    const images: Image[] = []; 
    for (const imageName of imageNames) {
      const image = await this.imageRepository.create(imageName, projectId)
      images.push(image)
    }

    return images;
  }

  async executeMany(fileNames: string[], projectId: number): Promise<Image[]> {
    await this.imageRepository.createMany(fileNames, projectId);

    // Fetch the inserted records
    return await this.imageRepository.findAll({
      where: {
        name: { in: fileNames },
        projectId,
      },
    });
  }
}
