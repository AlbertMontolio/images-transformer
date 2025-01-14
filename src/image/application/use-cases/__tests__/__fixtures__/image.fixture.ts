import { ImageWithRelations } from "src/image/domain/interfaces/image-with-relations";

const detectedObjects = [
  { id: 1, imageId: 1, createdAt: new Date(), x: 10, y: 20, width: 30, height: 40, class: 'object1', score: 0.9 },
  { id: 2, imageId: 1, createdAt: new Date(), x: 50, y: 60, width: 70, height: 80, class: 'object2', score: 0.8 },
]

export const createImage = (overrides: Partial<ImageWithRelations> = {}): ImageWithRelations => ({
  projectId: 1,
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
  detectedObjects,
  ...overrides,
});

export const createImages = (num: number) => {
  return Array.from({ length: num }, (_, index) => {
    const id = index + 1;
    const name = `foo-${id}`;

    return createImage({ id, name });
  });
}
