import request from 'supertest';
import { dependencies } from './image/utils/dependencies';
import { app, server, shutdown, startServer, getCorsOrigin } from './main';
import { ImageCategorizationQueue } from './image/infraestructure/queues/image-categorization.queue';
import { ImageTransformationQueue } from './image/infraestructure/queues/image-transformation.queue';

jest.mock('./image/utils/dependencies');
jest.mock('ioredis', () => require('ioredis-mock'));

jest.mock('@bull-board/api', () => ({
  BullMQAdapter: jest.fn(),
  createBullBoard: jest.fn(),
}));

describe('main', () => {
  afterAll((done) => {
    server.close(() => {
      console.log('Test server closed.');
      done();
    });
    jest.restoreAllMocks();
  })

  describe('shutdown function', () => {
    let exitSpy: jest.SpyInstance;
    let serverCloseSpy: jest.SpyInstance;

    beforeEach(() => {
      exitSpy = jest.spyOn(process, 'exit').mockImplementation();
    })

    afterEach(() => {
      jest.restoreAllMocks();
      exitSpy.mockRestore()
      serverCloseSpy.mockRestore();
    });

    describe('when process exits gracefully', () => {
      beforeEach(() => {
        serverCloseSpy = jest.spyOn(server, 'close').mockImplementation((callback) => {
          if (callback) callback();
          return server;
        });
      });

      it('should call process.exit with arg 0', async () => {
        await shutdown();
        expect(exitSpy).toHaveBeenCalledWith(0);
      });
    })

    describe('when process exits with error', () => {
      beforeEach(() => {
        const mockError = new Error('Queue close error');
        const imageCategorizationQueue = ImageCategorizationQueue.getInstance()
        const imageTransformationQueue = ImageTransformationQueue.getInstance()

        jest.spyOn(imageCategorizationQueue, 'close').mockRejectedValueOnce(mockError);
        jest.spyOn(imageTransformationQueue, 'close').mockResolvedValueOnce(undefined);
      })

      it('should call process.exit with arg 1', async () => {
        await shutdown();
        expect(exitSpy).toHaveBeenCalledWith(1);
      })
    })
  })

  describe('endpoints', () => {
    it('should process images on POST /process', async () => {
      const response = await request(app).post('/process');

      expect(response.status).toBe(200);
      expect(dependencies.processImagesUseCase.execute).toHaveBeenCalled();
    })

    it('should serve stats on GET /stats', async () => {
      const response = await request(app).get('/stats');

      expect(response.status).toBe(200);
      expect(dependencies.getStatsUseCase.execute).toHaveBeenCalled();
    })

    it('should remove images and related tables on GET /remove', async () => {
      const response = await request(app).get('/remove');

      expect(response.status).toBe(200);
      expect(dependencies.imageRepository.deleteAllImagesAndRelations).toHaveBeenCalled();
    })
  })

  describe('start server', () => {
    let listenSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.resetModules(); // Clear module cache to reload fresh
      process.env = {}; // Reset environment variables for each test

      // Mock the `listen` method
      listenSpy = jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
        if (callback) callback(); // Simulate server startup callback
        return {} as any; // Return a mock server object
      });
    });

    afterEach(() => {
      listenSpy.mockRestore(); // Restore the original implementation
      jest.clearAllMocks(); // Clear all mocks
    });

    describe('when PORT is not in env', () => {
      it('should use default port 3000', () => {
        // Call startServer
        const server = startServer();
        const DEFAULT_PORT = 3000
        console.log('### process.env', process.env)
    
        // Verify that app.listen was called with the default port
        expect(listenSpy).toHaveBeenCalledWith(DEFAULT_PORT, expect.any(Function));
        expect(server).toEqual({}); // Check the return value (mock server object)
      });
    })

    describe('when PORT is in env', () => {
      it('should use PORT in env', () => {
        process.env.PORT = '8080';
        // Call startServer
        const server = startServer();
        console.log('### process.env', process.env)
    
        // Verify that app.listen was called with the default port
        expect(listenSpy).toHaveBeenCalledWith("8080", expect.any(Function));
        expect(server).toEqual({}); // Check the return value (mock server object)
      });
    })
  })

  describe('getCorsOrigin', () => {
    beforeEach(() => {
      process.env = {}
    })

    describe('when CORS_ORIGIN is in env vars', () => {
      it('should return env value', () => {
        process.env.CORS_ORIGIN = 'http://localhost:3001';

        const corsOrigin = getCorsOrigin();
        expect(corsOrigin).toBe('http://localhost:3001'); 
      })
    })

    describe('when CORS_ORIGIN is not in env vars', () => {
      it('should return default value', () => {
        const corsOrigin = getCorsOrigin();
        expect(corsOrigin).toBe('*'); 
      })
    })
  })
})
