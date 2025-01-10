import { Image } from "@prisma/client";
import { DetectObjectsService } from "../../infraestructure/services/detect-objects.service";
import { DetectedObjectRepository } from "../../infraestructure/repositories/detected-object.repository";
import { DrawObjectsIntoImageUseCase } from "./draw-objects-into-image.use-case";
import { ImageWithRelations } from "src/image/domain/interfaces/image-with-relations";

export class DetectObjectsUseCase {
  detectObjectsService: DetectObjectsService;
  detectedObjectRepository: DetectedObjectRepository;
  drawObjectsIntoImageUseCase: DrawObjectsIntoImageUseCase;

  constructor() {
    this.detectObjectsService = new DetectObjectsService()
    this.detectedObjectRepository = new DetectedObjectRepository()
    this.drawObjectsIntoImageUseCase = new DrawObjectsIntoImageUseCase()
  }
  async execute(images: ImageWithRelations[]): Promise<void> {
    for (const image of images) {
      const imageId = image.id

      const predictions = await this.detectObjectsService.execute(image) 

      if (!predictions) {
        return
      }

      const originalWidth = image.width;
      const originalHeight = image.height;

      const cocoSize = 640
      const scaleX = originalWidth / cocoSize; // Resized image width
      const scaleY = originalHeight / cocoSize; // Resized image height

      for (const prediction of predictions) {
        const { bbox, ...rest } = prediction
        const [x, y, width, height] = bbox
        const input = {
          ...rest,
          x: x * scaleX,
          y: y * scaleY,
          width: width * scaleX,
          height: height * scaleY,
        }
  
        await this.detectedObjectRepository.create(input, imageId)
      }

      this.drawObjectsIntoImageUseCase.execute(image)
    }
  }
}
