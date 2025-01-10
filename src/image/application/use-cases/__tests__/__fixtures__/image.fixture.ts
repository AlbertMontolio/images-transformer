import { Categorization, DetectedObject, Image, Log, TransformedImage } from "@prisma/client";

interface ImageWithRelations extends Image {
  logs: Log[];
  categorizations: Categorization[];
  detectedObjects: DetectedObject[];
  transformedImage: TransformedImage;
}

export const createImage = (overrides: Partial<Image> = {}): ImageWithRelations => ({
  id: 1,
  name: 'default-name',
  createdAt: new Date(),
  path: null,
  size: null,
  width: null,
  height: null,
  logs: [],
  categorizations: [],
  transformedImage: null,
  detectedObjects: [],
  ...overrides,
});

export const createImages = (num: number) => {
  return Array.from({ length: num }, (_, index) => {
    const id = index + 1;
    const name = `foo-${id}`;

    return createImage({ id, name });
  });
}
