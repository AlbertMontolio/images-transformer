import sharp from 'sharp';
import path from 'path';
import { SaveObjectPredictionsIntoImageUseCase } from '../save-object-predictions-into-image.use-case';
import { inputImagesDir, outputImagesDir } from '../../../config';
import { createImage } from './__fixtures__/image.fixture';
import { DetectedObjectPrediction } from '../../../infraestructure/services/detect-objects.service';
import { ErrorRepository } from '../../../infraestructure/repositories/error.repository';

jest.mock('sharp');

describe('SaveObjectPredictionsIntoImageUseCase', () => {
  let saveObjectPredictionsIntoImageUseCase: SaveObjectPredictionsIntoImageUseCase;
  let mockSharpInstance: jest.Mocked<sharp.Sharp>;

  beforeEach(() => {
    mockSharpInstance = {
      composite: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<sharp.Sharp>;

    (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);
    const errorRepository = new ErrorRepository();
    saveObjectPredictionsIntoImageUseCase = new SaveObjectPredictionsIntoImageUseCase(errorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should overlay rectangles and save the output image', async () => {
      // Arrange
      const image = createImage({
        name: 'test-image.jpg',
        width: 1280,
        height: 720,
      });

      const predictions: DetectedObjectPrediction[] = [
        { class: 'person', score: 0.95, bbox: [10, 20, 30, 40] },
        { class: 'dog', score: 0.85, bbox: [50, 60, 70, 80] },
      ];

      const imagePath = path.join(inputImagesDir, image.name);
      const outputFilePath = path.join(outputImagesDir, 'detected_images', image.name);

      // Act
      await saveObjectPredictionsIntoImageUseCase.execute(image, predictions);

      // Assert
      expect(sharp).toHaveBeenCalledWith(imagePath);
      expect(mockSharpInstance.composite).toHaveBeenCalledWith([
        {
          input: expect.any(Buffer),
          top: 0,
          left: 0,
        },
      ]);
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith(outputFilePath);
    });

    it('should return early if no predictions are provided', async () => {
      // Arrange
      const image = createImage({
        name: 'test-image.jpg',
        width: 1280,
        height: 720,
      });

      // Act
      await saveObjectPredictionsIntoImageUseCase.execute(image, []);

      // Assert
      expect(sharp).not.toHaveBeenCalled();
      expect(mockSharpInstance.composite).not.toHaveBeenCalled();
      expect(mockSharpInstance.toFile).not.toHaveBeenCalled();
    });

    it('should return early if predictions is undefined', async () => {
      // Arrange
      const image = createImage({
        name: 'test-image.jpg',
        width: 1280,
        height: 720,
      });

      // Act
      await saveObjectPredictionsIntoImageUseCase.execute(image, undefined as DetectedObjectPrediction[] | undefined);

      // Assert
      expect(sharp).not.toHaveBeenCalled();
      expect(mockSharpInstance.composite).not.toHaveBeenCalled();
      expect(mockSharpInstance.toFile).not.toHaveBeenCalled();
    });
  });

  describe('createRectangles', () => {
    it('should generate the correct SVG elements for detected objects', () => {
      // Arrange
      const predictions: DetectedObjectPrediction[] = [
        { class: 'person', score: 0.95, bbox: [10, 20, 30, 40] },
        { class: 'dog', score: 0.85, bbox: [50, 60, 70, 80] },
      ];

      // Act
      const result = saveObjectPredictionsIntoImageUseCase['createRectangles'](predictions);

      // Assert
      // Test rect elements
      expect(result).toMatch(/x="10"\s+y="20"\s+width="30"\s+height="40"/);
      expect(result).toMatch(/x="50"\s+y="60"\s+width="70"\s+height="80"/);

      // Test text content
      expect(result).toContain('person (95.0%)');
      expect(result).toContain('dog (85.0%)');

      // Test styling attributes
      expect(result).toContain('fill="none"');
      expect(result).toContain('stroke="red"');
      expect(result).toContain('stroke-width="20"');
      expect(result).toContain('font-family="Arial"');
    });

    it('should return an empty string if no objects are detected', () => {
      // Act
      const result = saveObjectPredictionsIntoImageUseCase['createRectangles']([]);

      // Assert
      expect(result).toBe('');
    });
  });
});
