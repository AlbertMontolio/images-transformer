import { ReadImagesNamesUseCase } from "../read-images-names.use-case";
import fs from 'fs-extra';

jest.mock('fs-extra');

describe('ReadImagesNamesUseCase', () => {
  let readImagesNamesUseCase: ReadImagesNamesUseCase;

  beforeEach(() => {
    readImagesNamesUseCase = new ReadImagesNamesUseCase();
  });

  describe('execute', () => {
    it('should return null if the folder does not exist', async () => {
      // Arrange
      (fs.pathExists as jest.Mock).mockResolvedValueOnce(false);

      // Act
      const result = await readImagesNamesUseCase.execute('foo-path');

      // Assert
      expect(fs.pathExists).toHaveBeenCalledWith(expect.any(String));
      expect(result).toBeNull();
    });

    it('should return an array of image file names if the folder exists', async () => {
      // Arrange
      const mockFiles = ['image1.jpg', 'image2.png', 'document.pdf', 'image3.jpeg'];
      const expectedImages = ['image1.jpg', 'image2.png', 'image3.jpeg'];

      (fs.pathExists as jest.Mock).mockResolvedValueOnce(true);
      (fs.readdir as unknown as jest.Mock).mockResolvedValueOnce(mockFiles);

      // Act
      const result = await readImagesNamesUseCase.execute('foo-path');

      // Assert
      expect(fs.pathExists).toHaveBeenCalledWith(expect.any(String));
      expect(fs.readdir).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(expectedImages);
    });

    it('should return an empty array if no image files are present', async () => {
      // Arrange
      const mockFiles = ['document.pdf', 'file.txt'];
      (fs.pathExists as jest.Mock).mockResolvedValueOnce(true);
      (fs.readdir as unknown as jest.Mock).mockResolvedValueOnce(mockFiles);

      // Act
      const result = await readImagesNamesUseCase.execute('foo-path');

      // Assert
      expect(fs.pathExists).toHaveBeenCalledWith(expect.any(String));
      expect(fs.readdir).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual([]);
    });
  });

  describe('folderExists', () => {
    it('should return true if the folder exists', async () => {
      // Arrange
      (fs.pathExists as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await readImagesNamesUseCase.folderExists('mock-folder-path');

      // Assert
      expect(fs.pathExists).toHaveBeenCalledWith('mock-folder-path');
      expect(result).toBe(true);
    });

    it('should return false if the folder does not exist', async () => {
      // Arrange
      (fs.pathExists as jest.Mock).mockResolvedValueOnce(false);

      // Act
      const result = await readImagesNamesUseCase.folderExists('mock-folder-path');

      // Assert
      expect(fs.pathExists).toHaveBeenCalledWith('mock-folder-path');
      expect(result).toBe(false);
    });

    it('should log an error and return false if an exception occurs', async () => {
      // Arrange
      const mockError = new Error('Test error');
      (fs.pathExists as jest.Mock).mockRejectedValueOnce(mockError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const result = await readImagesNamesUseCase.folderExists('mock-folder-path');

      // Assert
      expect(fs.pathExists).toHaveBeenCalledWith('mock-folder-path');
      expect(consoleSpy).toHaveBeenCalledWith(
        `Error checking if folder exists: ${mockError.message}`
      );
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });
  });
});
