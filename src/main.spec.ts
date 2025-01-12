import request from 'supertest';
import { app, server } from './main';
import { container } from './shared/container';
import { ImageRepository } from './image/infraestructure/repositories/image.repository';

describe('Main App', () => {
  afterAll(async () => {
    server.close();
  });

  describe('GET /stats', () => {
    it('should return stats', async () => {
      // Mock the repository method
      const mockImageRepository = {
        getStats: jest.fn().mockResolvedValue(5),
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        deleteAllImagesAndRelations: jest.fn()
      } as unknown as ImageRepository;
      
      container.registerInstance(ImageRepository, mockImageRepository);

      const response = await request(app).get('/stats');
      expect(response.status).toBe(200);
      expect(response.body).toBe(5);
    });
  });

  describe('GET /remove', () => {
    it('should delete all images and relations', async () => {
      const mockImageRepository = {
        deleteAllImagesAndRelations: jest.fn().mockResolvedValue(undefined),
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        getStats: jest.fn()
      } as unknown as ImageRepository;
      
      container.registerInstance(ImageRepository, mockImageRepository);

      const response = await request(app).get('/remove');
      expect(response.status).toBe(200);
      expect(mockImageRepository.deleteAllImagesAndRelations).toHaveBeenCalled();
    });
  });
});
