import request from 'supertest';
import { dependencies } from './image/utils/dependencies';
import { app, server, shutdown } from './main';
import { imageCategorizationQueue } from './image/infraestructure/queues/image-categorization.queue';
import { imageTransformationQueue } from './image/infraestructure/queues/image-transformation.queue';

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

      // const listenSpy = jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
      //   callback(); // Call the callback to simulate server startup
      //   return server; // Return a dummy server object
      // });

      // expect(listenSpy).toHaveBeenLastCalledWith(3000)
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

  // describe.only('envirionment variables', () => {
  //   let listenSpy: jest.SpyInstance;
  //   beforeEach(async () => {
  //     jest.resetModules();
  //     listenSpy = jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
  //       callback(); // Call the callback to simulate server startup
  //       return server; // Return a dummy server object
  //     });
  //   })

  //   it('should use default port 3000 when process.env.PORT is not set', async () => {

  //     require('./main');

  //     console.log('### process.env', process.env)
  //     expect(listenSpy).toHaveBeenLastCalledWith(3000)
  //   });
  // })
})
