import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import imagesRoutes from '../image.routes';
import { container } from '../../../../shared/container';
import { ImageRepository } from '../../repositories/image.repository';
import { ProcessImagesUseCase } from '../../../application/use-cases/process-images.use-case';
import { GetStatsUseCase } from '../../../application/use-cases/get-stats.use-case';

describe('Image Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/images', imagesRoutes);
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe('GET /images', () => {
    it('should return all images', async () => {
      const mockImages = [{ id: 1, name: 'test.jpg' }];
      const mockImageRepository = {
        findAll: jest.fn().mockResolvedValue(mockImages),
        create: jest.fn(),
        findOne: jest.fn(),
        getStats: jest.fn(),
        deleteAllImagesAndRelations: jest.fn()
      } as unknown as ImageRepository;
      
      container.registerInstance(ImageRepository, mockImageRepository);

      const response = await request(app).get('/images');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockImages);
    });

    it('should handle errors when fetching images', async () => {
      const mockImageRepository = {
        findAll: jest.fn().mockRejectedValue(new Error('Database error')),
      } as unknown as ImageRepository;
      
      container.registerInstance(ImageRepository, mockImageRepository);

      const response = await request(app).get('/images');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch images' });
    });
  });

  describe('POST /images/process', () => {
    it('should process images', async () => {
      const mockProcessImagesUseCase = {
        execute: jest.fn().mockResolvedValue(undefined)
      } as unknown as ProcessImagesUseCase;
      
      container.registerInstance(ProcessImagesUseCase, mockProcessImagesUseCase);

      const response = await request(app).post('/images/process');
      expect(response.status).toBe(200);
      expect(mockProcessImagesUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('GET /images/:id', () => {
    it('should return a single image', async () => {
      const mockImage = { id: 1, name: 'test.jpg' };
      const mockImageRepository = {
        findOne: jest.fn().mockResolvedValue(mockImage),
      } as unknown as ImageRepository;
      
      container.registerInstance(ImageRepository, mockImageRepository);

      const response = await request(app).get('/images/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockImage);
    });

    it('should return 404 when image is not found', async () => {
      const mockImageRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      } as unknown as ImageRepository;
      
      container.registerInstance(ImageRepository, mockImageRepository);

      const response = await request(app).get('/images/1');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Image not found' });
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/images/invalid');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'ID must be a valid number' });
    });
  });

  describe('GET /images/stats', () => {
    it('should return stats', async () => {
      const mockStats = { total: 5 };
      const mockGetStatsUseCase = {
        execute: jest.fn().mockResolvedValue(mockStats)
      } as unknown as GetStatsUseCase;
      
      container.registerInstance(GetStatsUseCase, mockGetStatsUseCase);

      const response = await request(app).get('/images/stats');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });
  });
}); 