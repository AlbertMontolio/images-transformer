import { CreateImagesInDbUseCase } from "../create-images-in-db.use-case"
import { createImage, createImages } from "./__fixtures__/image.fixture";

jest.mock('../../../infraestructure/repositories/image.repository');

describe('CreateImagesInDbUseCase', () => {
  let createImagesInDbUseCase: CreateImagesInDbUseCase;
  const mockImages = createImages(2)
  const imageNames = ['foo-one', 'foo-two']
  let mockCreate: jest.Mock;

  beforeEach(() => {
    createImagesInDbUseCase = new CreateImagesInDbUseCase()

    mockCreate = jest.fn();
    createImagesInDbUseCase.imageRepository.create = mockCreate;
  })

  it('calls imageRepository.create with proper args', async () => {
    mockCreate
      .mockResolvedValueOnce(mockImages[0])
      .mockResolvedValueOnce(mockImages[1]);

    const result = await createImagesInDbUseCase.execute(imageNames);
    console.log('### result', result)
    console.log('### mockImages', mockImages)
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreate).toHaveBeenNthCalledWith(1, 'foo-one');
    expect(mockCreate).toHaveBeenNthCalledWith(2, 'foo-two');
    expect(result).toEqual(mockImages);
  })
})