import * as tf from '@tensorflow/tfjs-node';
import * as mobilenet from '@tensorflow-models/mobilenet';
import sharp from 'sharp';
import { CategorizeImageService } from '../categorize-image.service';

jest.mock('@tensorflow/tfjs-node');
jest.mock('@tensorflow-models/mobilenet');
jest.mock('sharp');

describe('CategorizeImageService', () => {
  let service: CategorizeImageService;
  // TODO: use fixtures
  const image = {
    name: 'test.jpg',
    id: 1,
    createdAt: new Date(),
    size: 100,
    path: 'input/path',
    width: 1000,
    height: 400,
  };

  beforeEach(() => {
    service = new CategorizeImageService();
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

    const mockModel = {
      classify: jest.fn().mockResolvedValue(mockPredictions),
    };
    (mobilenet.load as jest.Mock).mockResolvedValue(mockModel);


    // Act
    const predictions = await service.execute(image);

    // Assert
    expect(predictions).toEqual(mockPredictions);
    expect(sharp).toHaveBeenCalledWith('path/to/image.jpg');
    expect(mockModel.classify).toHaveBeenCalledWith(mockTensor);
    expect(mockTensor.dispose).toHaveBeenCalled();
  });

  it('should throw an error if classification fails', async () => {
    // Arrange
    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => ({
      toBuffer: jest.fn().mockRejectedValue(new Error('Sharp error')),
    }) as any);

    // Act & Assert
    await expect(service.execute(image)).rejects.toThrow('Image classification failed');
  });

  it('should dispose the tensor even if an error occurs', async () => {
    // Arrange
    const mockTensor = { dispose: jest.fn() } as unknown as tf.Tensor3D;
    (tf.node.decodeImage as jest.Mock).mockReturnValue(mockTensor);

    (sharp as jest.MockedFunction<typeof sharp>).mockImplementation(() => ({
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image')),
    }) as any);

    (mobilenet.load as jest.Mock).mockRejectedValue(new Error('Model load error'));

    // Act & Assert
    await expect(service.execute(image)).rejects.toThrow('Image classification failed');
    expect(mockTensor.dispose).toHaveBeenCalled();
  });
});
