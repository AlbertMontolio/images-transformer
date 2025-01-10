import request from 'supertest';
import express from 'express';
import router from '../image.routes';
import { dependencies } from '../../../utils/dependencies';

jest.mock('../../../utils/dependencies', () => ({
  dependencies: {
    imageRepository: {
      findAll: jest.fn(),
      findOne: jest.fn(),
    },
  },
}));

describe('Images Router', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/images', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /images', () => {
    it('should fetch all images', async () => {
      // Arrange
      const mockImages = [{ id: 1, name: 'image1.jpg' }, { id: 2, name: 'image2.jpg' }];
      (dependencies.imageRepository.findAll as jest.Mock).mockResolvedValueOnce(mockImages);

      // Act
      const res = await request(app).get('/images');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockImages);
      expect(dependencies.imageRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching images', async () => {
      // Arrange
      (dependencies.imageRepository.findAll as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      // Act
      const res = await request(app).get('/images');

      // Assert
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch images' });
      expect(dependencies.imageRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /images/:id', () => {
    it('should fetch an image by ID', async () => {
      // Arrange
      const mockImage = { id: 1, name: 'image1.jpg' };
      (dependencies.imageRepository.findOne as jest.Mock).mockResolvedValueOnce(mockImage);

      // Act
      const res = await request(app).get('/images/1');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockImage);
      expect(dependencies.imageRepository.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 400 if ID is invalid', async () => {
      // Act
      const res = await request(app).get('/images/invalid-id');

      // Assert
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'ID must be a valid number' });
      expect(dependencies.imageRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return 404 if image is not found', async () => {
      // Arrange
      (dependencies.imageRepository.findOne as jest.Mock).mockResolvedValueOnce(null);

      // Act
      const res = await request(app).get('/images/999');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Image not found' });
      expect(dependencies.imageRepository.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle errors when fetching an image by ID', async () => {
      // Arrange
      (dependencies.imageRepository.findOne as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      // Act
      const res = await request(app).get('/images/1');

      // Assert
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch image' });
      expect(dependencies.imageRepository.findOne).toHaveBeenCalledWith(1);
    });
  });
});
