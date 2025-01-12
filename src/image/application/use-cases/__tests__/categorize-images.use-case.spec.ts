import { CategorizeImagesUseCaseError } from "../../../domain/errors/categorize-images.use-case.error";
import { ImageCategorizationQueue } from "../../../infraestructure/queues/image-categorization.queue";
import { CategorizeImagesUseCase } from "../categorize-images.use-case";
import { createImage } from "./__fixtures__/image.fixture";

jest.mock('../../../infraestructure/queues/image-categorization.queue', () => ({
  imageCategorizationQueue: {
    add: jest.fn(),
  },
}));

describe('CategorizeImagesUseCase', () => {
  let categorizeImagesUseCase: CategorizeImagesUseCase;
  let imageCategorizationQueue: ImageCategorizationQueue

  beforeEach(() => {
    imageCategorizationQueue = ImageCategorizationQueue.getInstance()
    categorizeImagesUseCase = new CategorizeImagesUseCase()
    jest.spyOn(categorizeImagesUseCase.logRepository, 'create').mockResolvedValue();
  })

  describe('execute', () => {
    const imageOne = createImage({ id: 1, name: 'foo-one' });
    const imageTwo = createImage({ id: 2, name: 'foo-two' });
    const images = [imageOne, imageTwo]

    describe('when successful', () => {
      it('should call categorizeImage for each image', async () => {
        (imageCategorizationQueue.add as jest.Mock).mockResolvedValue(undefined);

        await categorizeImagesUseCase.execute(images);

        expect(imageCategorizationQueue.add).toHaveBeenCalledTimes(2);

        expect(imageCategorizationQueue.add).toHaveBeenCalledWith('process-image', {
          imagePath: expect.stringContaining(imageOne.name),
          imageId: 1,
        });
        expect(imageCategorizationQueue.add).toHaveBeenCalledWith('process-image', {
          imagePath: expect.stringContaining(imageTwo.name),
          imageId: 2,
        });
      })

      it('should call logRepository.create with correct arguments', async () => {
        await categorizeImagesUseCase.execute(images);
    
        expect(categorizeImagesUseCase.logRepository.create).toHaveBeenCalledTimes(2);
      });
    })

    describe('when error in categorizeImage use case', () => {
      it('raises CategorizeImagesUseCaseError', async () => {
        const mockError = new Error();
        (imageCategorizationQueue.add as jest.Mock).mockRejectedValueOnce(mockError);

        await expect(categorizeImagesUseCase.execute(images)).rejects.toThrow(
          CategorizeImagesUseCaseError
        );
      })
    })
  })
})