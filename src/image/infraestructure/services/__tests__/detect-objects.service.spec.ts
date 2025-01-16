import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import sharp, { Sharp } from 'sharp';
import { DetectObjectsService } from '../detect-objects.service';
import { createImage } from '../../../application/use-cases/__tests__/__fixtures__/image.fixture';
import path from 'path';
import { inputImagesDir } from '../../../config';

jest.mock('@tensorflow/tfjs-node');
jest.mock('@tensorflow-models/coco-ssd');
jest.mock('sharp');

describe('DetectObjectsService', () => {
  let service: DetectObjectsService;
  let mockModel: jest.Mocked<cocoSsd.ObjectDetection>;
  
  beforeEach(() => {
    mockModel = {
      detect: jest.fn().mockResolvedValue([
        { class: 'person', score: 0.95, bbox: [10, 20, 30, 40] },
        { class: 'cat', score: 0.85, bbox: [50, 60, 70, 80] },
      ])
    } as unknown as jest.Mocked<cocoSsd.ObjectDetection>;
    
    service = new DetectObjectsService(mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should detect objects in an image', async () => {
    // Arrange
    const mockImage = createImage({ 
      id: 1, 
      name: 'image.jpg', 
      width: 640, 
      height: 480, 
      size: 12345 
    });
    
    const mockResizedImageBuffer = Buffer.from('mock-image-buffer');
    const mockSharpInstance: Partial<Sharp> = {
      resize: jest.fn().mockReturnThis(),
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(mockResizedImageBuffer),
      metadata: jest.fn().mockResolvedValue({ width: 640, height: 480 }),
    };

    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(
      () => mockSharpInstance as Sharp
    );

    const mockInputTensor = { 
      dispose: jest.fn(),
      toInt: jest.fn().mockReturnThis()
    } as unknown as tf.Tensor3D;
    
    const mockImageTensor = { 
      shape: [640, 640, 3],
      dispose: jest.fn(),
      toInt: jest.fn().mockReturnValue(mockInputTensor)
    } as unknown as tf.Tensor3D;

    (tf.node.decodeImage as jest.Mock).mockReturnValue(mockImageTensor);

    // Act
    const results = await service.execute(mockImage);

    // Assert
    const heightRatio = 480/640;
    expect(results).toEqual([
      { 
        class: 'person', 
        score: 0.95, 
        bbox: [10, 20 * heightRatio, 30, 40 * heightRatio] 
      },
      { 
        class: 'cat', 
        score: 0.85, 
        bbox: [50, 60 * heightRatio, 70, 80 * heightRatio] 
      },
    ]);
    
    const expectedPath = path.join(inputImagesDir, mockImage.name);
    expect(sharp).toHaveBeenCalledWith(expectedPath);
    expect(mockModel.detect).toHaveBeenCalledWith(mockInputTensor);
    expect(mockImageTensor.dispose).toHaveBeenCalled();
    expect(mockInputTensor.dispose).toHaveBeenCalled();
  });

  it('should throw an error if object detection fails', async () => {
    // Arrange
    const mockImage = createImage({ 
      id: 1, 
      name: 'image.jpg', 
      width: 640, 
      height: 480, 
      size: 12345 
    });
    
    const mockSharpInstance: Partial<Sharp> = {
      resize: jest.fn().mockReturnThis(),
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-buffer')),
      metadata: jest.fn().mockResolvedValue({ width: 640, height: 480 }),
    };

    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(
      () => mockSharpInstance as Sharp
    );

    const mockTensor = { 
      dispose: jest.fn(),
      toInt: jest.fn().mockReturnThis(),
      shape: [640, 640, 3]
    } as unknown as tf.Tensor3D;

    (tf.node.decodeImage as jest.Mock).mockReturnValue(mockTensor);
    mockModel.detect.mockRejectedValue(new Error('Detection failed'));

    // Act & Assert
    await expect(service.execute(mockImage)).rejects.toThrow('Object detection failed');
    expect(mockTensor.dispose).toHaveBeenCalled();
  });

  it('should throw an error if sharp processing fails', async () => {
    // Arrange
    const mockImage = createImage({ 
      id: 1, 
      name: 'image.jpg', 
      width: 640, 
      height: 480, 
      size: 12345 
    });

    const mockSharpInstance: Partial<Sharp> = {
      metadata: jest.fn().mockRejectedValue(new Error('Sharp error')),
      resize: jest.fn().mockReturnThis(),
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-buffer')),
    };

    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(
      () => mockSharpInstance as Sharp
    );

    // Act & Assert
    await expect(service.execute(mockImage)).rejects.toThrow('Failed to resize image: dimensions mismatch');
  });
});
