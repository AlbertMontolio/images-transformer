import { Image } from "@prisma/client";
import { DetectObjectsService } from "../../infraestructure/services/detect-objects.service.js";
import { DetectedObjectRepository } from "../../infraestructure/repositories/detected-object.repository.js";
import { DrawObjectsIntoImageUseCase } from "./draw-objects-into-image.use-case.js";

export class DetectObjectsUseCase {
  detectObjectsService: DetectObjectsService;
  detectedObjectRepository: DetectedObjectRepository;
  drawObjectsIntoImageUseCase: DrawObjectsIntoImageUseCase;

  constructor() {
    this.detectObjectsService = new DetectObjectsService()
    this.detectedObjectRepository = new DetectedObjectRepository()
    this.drawObjectsIntoImageUseCase = new DrawObjectsIntoImageUseCase()
  }
  async execute(images: Image[]): Promise<void> {
    for (const image of images) {
      const imageId = image.id
      const imagePath = image.path

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

      this.drawObjectsIntoImageUseCase.execute(imageId)
    }
  }
}
