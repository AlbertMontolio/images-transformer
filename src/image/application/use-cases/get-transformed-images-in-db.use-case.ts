import { TransformedImageRepository } from "../../infraestructure/repositories/transformed-image.repository";

export class GetTransformedImagesInDbUseCase {
  async execute() {
    const transformedImageRepository = new TransformedImageRepository()
    const transformedImages = await transformedImageRepository.findAll()
    return transformedImages;
  }
}