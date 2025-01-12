import request from 'supertest';
import { app } from '../../../../main';
import { container } from '../../../../shared/container';
import { ImageRepository } from '../../repositories/image.repository';
import { ProcessImagesUseCase } from '../../../application/use-cases/process-images.use-case';

describe('Image Routes', () => {
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
}); 