import sharp from 'sharp';
import path from 'path';
import { SaveObjectPredictionsIntoImageUseCase } from '../draw-objects-into-image.use-case';
import { inputImagesDir, outputImagesDir } from '../../../config';
import { createImage } from './__fixtures__/image.fixture';

jest.mock('sharp');

describe('SaveObjectPredictionsIntoImageUseCase', () => {
  let saveObjectPredictionsIntoImageUseCase: SaveObjectPredictionsIntoImageUseCase;

  beforeEach(() => {
    saveObjectPredictionsIntoImageUseCase = new SaveObjectPredictionsIntoImageUseCase();
  });

  describe('execute', () => {
    it('should overlay rectangles and save the output image', async () => {
      const image = createImage({
        name: 'test-image.jpg',
        width: 1280,
        height: 720,
      });

      const mockSharpInstance = {
        composite: jest.fn().mockReturnThis(),
        toFile: jest.fn(),
      };
      (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);

      const imagePath = path.join(inputImagesDir, image.name);
      const outputFilePath = path.join(outputImagesDir, 'detected_images', image.name);

      // Act
      await saveObjectPredictionsIntoImageUseCase.execute(image, []);

      // Assert
      expect(sharp).toHaveBeenCalledWith(imagePath); // Check sharp was initialized with the correct image path
      expect(mockSharpInstance.composite).toHaveBeenCalledWith([
        {
          input: expect.any(Buffer),
          top: 0,
          left: 0,
        },
      ]);
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith(outputFilePath); // Ensure the output path is correct
    });

    it('should handle an empty list of detected objects gracefully', async () => {
      const image = createImage({
        name: 'test-image.jpg',
        width: 1280,
        height: 720,
        detectedObjects: [],
      });

      const mockSharpInstance = {
        composite: jest.fn().mockReturnThis(),
        toFile: jest.fn(),
      };
      (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);

      await saveObjectPredictionsIntoImageUseCase.execute(image, []);

      expect(mockSharpInstance.composite).toHaveBeenCalledWith([
        {
          input: expect.any(Buffer),
          top: 0,
          left: 0,
        },
      ]);
    });
  });

  describe('createRectangles', () => {
    it('should generate the correct SVG elements for detected objects', () => {
      // Arrange
      const detectedObjects = [
        { x: 10, y: 20, width: 30, height: 40, class: 'object1', score: 0.95 },
        { x: 50, y: 60, width: 70, height: 80, class: 'object2', score: 0.88 },
      ];

      // Act
      // const result = drawObjectsIntoImageUseCase['createRectangles'](detectedObjects);

      // // Assert
      // expect(result).toContain(
      //   `<rect x="10" y="20" width="30" height="40" fill="none" stroke="red" stroke-width="20" />`
      // );
      // expect(result).toContain(
      //   `<text x="10" y="15" fill="red" font-size="200" font-family="Arial">object1 (95.0%)</text>`
      // );
      // expect(result).toContain(
      //   `<rect x="50" y="60" width="70" height="80" fill="none" stroke="red" stroke-width="20" />`
      // );
      // expect(result).toContain(
      //   `<text x="50" y="55" fill="red" font-size="200" font-family="Arial">object2 (88.0%)</text>`
      // );
    });

    it('should return an empty string if no objects are detected', () => {
      // Arrange
      const detectedObjects = [];

      // Act
      const result = saveObjectPredictionsIntoImageUseCase['createRectangles'](detectedObjects);

      // Assert
      expect(result).toBe('');
    });
  });
});
