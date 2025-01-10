import { Image } from "@prisma/client";
import path from "path";

import { TransformImagesUseCase } from "../transform-images.use-case";
import { createImage } from "./__fixtures__/image.fixture";
import { imageTransformationQueue } from "../../../infraestructure/queues/image-transformation.queue";
import { inputImagesDir } from "../../../config";

jest.mock('../../../infraestructure/queues/image-transformation.queue', () => ({
  imageTransformationQueue: {
    add: jest.fn(),
  },
}));

describe('TransformImagesUseCase', () => {
  let transformImagesUseCase: TransformImagesUseCase;

  beforeEach(() => {
    transformImagesUseCase = new TransformImagesUseCase();
    jest.clearAllMocks();
  });

  it('should add transformation jobs for each image to the queue', async () => {
    // Arrange
    const images = [
      createImage({ id: 1, name: 'image1.jpg' }),
      createImage({ id: 2, name: 'image2.png' }),
    ];
    const watermarkText = "Test Watermark";

    // Act
    await transformImagesUseCase.execute({ images, watermarkText });

    // Assert
    expect(imageTransformationQueue.add).toHaveBeenCalledTimes(2); // Called for each image
    expect(imageTransformationQueue.add).toHaveBeenNthCalledWith(1, 'transform-image', {
      imagePath: path.join(inputImagesDir, 'image1.jpg'),
      imageName: 'image1.jpg',
      watermarkText,
      imageId: 1,
    });
    expect(imageTransformationQueue.add).toHaveBeenNthCalledWith(2, 'transform-image', {
      imagePath: path.join(inputImagesDir, 'image2.png'),
      imageName: 'image2.png',
      watermarkText,
      imageId: 2,
    });
  });

  it('should not add any jobs if images array is empty', async () => {
    // Arrange
    const images: Image[] = [];
    const watermarkText = "Test Watermark";

    // Act
    await transformImagesUseCase.execute({ images, watermarkText });

    // Assert
    expect(imageTransformationQueue.add).not.toHaveBeenCalled();
  });
});
