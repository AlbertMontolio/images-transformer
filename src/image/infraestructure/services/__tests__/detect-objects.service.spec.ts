import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import sharp from 'sharp';
import { DetectObjectsService } from '../detect-objects.service';
import { createImage } from '../../../application/use-cases/__tests__/__fixtures__/image.fixture';
// ### TODO: move fixtures to domain

jest.mock('@tensorflow/tfjs-node');
jest.mock('@tensorflow-models/coco-ssd');
jest.mock('sharp');

describe('DetectObjectsService', () => {
  let service: DetectObjectsService;

  beforeEach(() => {
    const mockModel = {
      detect: jest.fn()
    };
    service = new DetectObjectsService(mockModel as unknown as cocoSsd.ObjectDetection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should detect objects in an image', async () => {
    // Arrange
    const mockImage = createImage({ id: 1, name: 'image.jpg', width: 640, height: 480, size: 12345 })
    const mockResizedImageBuffer = Buffer.from('mock-image-buffer');
    const mockTensor = { shape: [640, 640, 3], toInt: jest.fn(), dispose: jest.fn() } as unknown as tf.Tensor3D;
    const mockModel = {
      detect: jest.fn().mockResolvedValue([
        { class: 'person', score: 0.95, bbox: [10, 20, 30, 40] },
        { class: 'cat', score: 0.85, bbox: [50, 60, 70, 80] },
      ]),
    };

    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(mockResizedImageBuffer),
    }) as any);

    (tf.node.decodeImage as jest.Mock).mockReturnValue(mockTensor);
    (cocoSsd.load as jest.Mock).mockResolvedValue(mockModel);

    // Act
    const results = await service.execute(mockImage);

    // Assert
    expect(results).toEqual([
      { class: 'person', score: 0.95, bbox: [10, 20, 30, 40] },
      { class: 'cat', score: 0.85, bbox: [50, 60, 70, 80] },
    ]);
    expect(sharp).toHaveBeenCalledWith(expect.stringContaining('image.jpg'));
    expect(mockModel.detect).toHaveBeenCalledWith(mockTensor.toInt());
    expect(mockTensor.dispose).toHaveBeenCalled();
  });

  it('should throw an error if object detection fails', async () => {
    // Arrange
    const mockImage = createImage({ id: 1, name: 'image.jpg', width: 640, height: 480, size: 12345 });
    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockRejectedValue(new Error('Sharp error')),
    }) as any);

    // Act & Assert
    await expect(service.execute(mockImage)).rejects.toThrow('Object detection failed');
  });

  it('should dispose tensors even if an error occurs', async () => {
    // Arrange
    const mockImage = createImage({ id: 1, name: 'image.jpg', width: 640, height: 480, size: 12345 });
    const mockTensor = { dispose: jest.fn() } as unknown as tf.Tensor3D;

    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-buffer')),
    }) as any);

    (tf.node.decodeImage as jest.Mock).mockReturnValue(mockTensor);
    (cocoSsd.load as jest.Mock).mockRejectedValue(new Error('Model load error'));

    // Act & Assert
    await expect(service.execute(mockImage)).rejects.toThrow('Object detection failed');
    expect(mockTensor.dispose).toHaveBeenCalled();
  });
});
