import { DetectObjectsUseCase } from "../detect-objects.use-case";
import { SaveObjectPredictionsIntoImageUseCase } from "../draw-objects-into-image.use-case";
import { createImages } from "./__fixtures__/image.fixture";

jest.mock('../../../infraestructure/services/detect-objects.service');
jest.mock('../../../infraestructure/repositories/detected-object.repository');
jest.mock('../draw-objects-into-image.use-case'); 

describe('DetectObjectsUseCase', () => {
  let detectObjectsUseCase: DetectObjectsUseCase;
  let saveObjectPredictionsIntoImageUseCase: SaveObjectPredictionsIntoImageUseCase;
  let mockDetectObjectsServiceExecute: jest.Mock;
  let mockDetectedObjectRepository: jest.Mock;
  let mockDrawObjectsIntoImageUseCaseExecute: jest.Mock;
  const mockImages = createImages(2)
  const [imageOne, imageTwo] = mockImages

  beforeEach(() => {
    detectObjectsUseCase = new DetectObjectsUseCase();
    saveObjectPredictionsIntoImageUseCase = new SaveObjectPredictionsIntoImageUseCase()

    mockDetectObjectsServiceExecute = jest.fn();
    detectObjectsUseCase.detectObjectsService.execute = mockDetectObjectsServiceExecute;

    mockDrawObjectsIntoImageUseCaseExecute = jest.fn();
    detectObjectsUseCase.saveObjectPredictionsIntoImageUseCase.execute = mockDrawObjectsIntoImageUseCaseExecute;
  })

  describe('execute', () => {
    describe('when predictions are returned', () => {
      const predictionsOne = [
        { bbox: [10, 20, 30, 40], label: 'object1' },
        { bbox: [50, 60, 70, 80], label: 'object2' },
      ];
      const predictionsTwo = [
        { bbox: [11, 21, 31, 41], label: 'object3' },
        { bbox: [51, 61, 71, 81], label: 'object4' },
      ];

      beforeEach(() => {
        mockDetectObjectsServiceExecute
          .mockResolvedValueOnce(predictionsOne)
          .mockResolvedValueOnce(predictionsTwo);
      })

      it('should call detectObjectsUseCase.execute', async () => {
        await detectObjectsUseCase.execute(mockImages);

        expect(mockDetectObjectsServiceExecute).toHaveBeenCalledTimes(2);
        expect(mockDetectObjectsServiceExecute).toHaveBeenCalledWith(imageOne);
        expect(mockDetectObjectsServiceExecute).toHaveBeenCalledWith(imageTwo);
      })

      it('should call drawObjectsIntoImageUseCase.execute', async () => {
        await detectObjectsUseCase.execute(mockImages);

        expect(mockDrawObjectsIntoImageUseCaseExecute).toHaveBeenCalledWith(imageOne)
        expect(mockDrawObjectsIntoImageUseCaseExecute).toHaveBeenCalledWith(imageTwo)
      })
    })

    describe('when no predictions', () => {
      beforeEach(() => {
        mockDetectObjectsServiceExecute
          .mockResolvedValueOnce(null)
      })

      it('should not call service methods', async () => {
        await detectObjectsUseCase.execute(mockImages);

        expect(mockDrawObjectsIntoImageUseCaseExecute).not.toHaveBeenCalled()
      })
    })
  })
})