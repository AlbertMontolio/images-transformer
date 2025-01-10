import { Categorization, DetectedObject, Image, Log, TransformedImage } from "@prisma/client";

export interface ImageWithRelations extends Image {
  logs: Log[];
  categorizations: Categorization[];
  detectedObjects: DetectedObject[];
  transformedImage: TransformedImage;
}
