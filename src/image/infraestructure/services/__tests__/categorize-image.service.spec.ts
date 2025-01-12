import * as tf from '@tensorflow/tfjs-node';
import * as mobilenet from '@tensorflow-models/mobilenet';
import sharp from 'sharp';
import { CategorizeImageService } from '../categorize-image.service';

jest.mock('@tensorflow/tfjs-node');
jest.mock('@tensorflow-models/mobilenet');
jest.mock('sharp');

describe('CategorizeImageService', () => {
  let service: CategorizeImageService;
  let mockModel: jest.Mocked<mobilenet.MobileNet>;
  
  const image = {
    name: 'test.jpg',
    id: 1,
    createdAt: new Date(),
    size: 100,
    path: '/Users/albertmontolio/Documents/coding_area/interviews/koerber/input_images/test.jpg',
    width: 1000,
    height: 400,
  };

  beforeEach(() => {
    // Create a properly typed mock model
    mockModel = {
      classify: jest.fn().mockResolvedValue([
        { className: 'cat', probability: 0.9 },
        { className: 'dog', probability: 0.8 },
      ])
    } as unknown as jest.Mocked<mobilenet.MobileNet>;
    
    service = new CategorizeImageService(mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should classify the image and return predictions', async () => {
    // Arrange
    const mockImageBuffer = Buffer.from('mock-image');
    const mockPredictions = [
      { className: 'cat', probability: 0.9 },
      { className: 'dog', probability: 0.8 },
    ];

    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => ({
      toBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
    }) as any);

    const mockTensor = { dispose: jest.fn() } as unknown as tf.Tensor3D;
    (tf.node.decodeImage as jest.Mock).mockReturnValue(mockTensor);

    mockModel.classify.mockResolvedValue(mockPredictions);

    // Act
    const predictions = await service.execute(image);

    // Assert
    expect(predictions).toEqual(mockPredictions);
    expect(sharp).toHaveBeenCalledWith(image.path);
    expect(mockModel.classify).toHaveBeenCalledWith(mockTensor);
    expect(mockTensor.dispose).toHaveBeenCalled();
  });

  it('should throw an error if classification fails', async () => {
    // Arrange
    const mockImageBuffer = Buffer.from('mock-image');
    const mockTensor = { dispose: jest.fn() } as unknown as tf.Tensor3D;
    
    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => ({
      toBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
    }) as any);
    
    (tf.node.decodeImage as jest.Mock).mockReturnValue(mockTensor);
    mockModel.classify.mockRejectedValue(new Error('Classification failed'));

    // Act & Assert
    await expect(service.execute(image)).rejects.toThrow('Image classification failed');
    expect(mockTensor.dispose).toHaveBeenCalled();
  });

  it('should dispose the tensor even if an error occurs', async () => {
    // Arrange
    const mockImageBuffer = Buffer.from('mock-image');
    const mockTensor = { dispose: jest.fn() } as unknown as tf.Tensor3D;
    
    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => ({
      toBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
    }) as any);
    
    (tf.node.decodeImage as jest.Mock).mockReturnValue(mockTensor);
    mockModel.classify.mockRejectedValue(new Error('Classification failed'));

    // Act & Assert
    await expect(service.execute(image)).rejects.toThrow('Image classification failed');
    expect(mockTensor.dispose).toHaveBeenCalled();
  });
});
