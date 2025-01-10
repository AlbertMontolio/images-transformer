import { FilterSelectorService, FilterOption } from '../filter-selector.service';
import { Sharp } from 'sharp';

jest.mock('sharp');

describe('FilterSelectorService', () => {
  let service: FilterSelectorService;

  beforeEach(() => {
    service = new FilterSelectorService();
  });

  it('should return a random filter', () => {
    // Act
    const filter = service.getRandomFilter();

    // Assert
    expect(filter).toHaveProperty('name');
    expect(filter).toHaveProperty('applyFilter');
    expect(typeof filter.applyFilter).toBe('function');
  });

  it('should apply greyscale filter correctly', () => {
    // Arrange
    const mockSharpInstance = { greyscale: jest.fn().mockReturnThis() } as unknown as Sharp;

    // Act
    const filter = (service as any).greyScale();
    filter.applyFilter(mockSharpInstance);

    // Assert
    expect(mockSharpInstance.greyscale).toHaveBeenCalledTimes(1);
    expect(filter.name).toBe('greyscale');
  });

  it('should apply blur filter correctly', () => {
    // Arrange
    const mockSharpInstance = { blur: jest.fn().mockReturnThis() } as unknown as Sharp;

    // Act
    const filter = (service as any).blur();
    filter.applyFilter(mockSharpInstance);

    // Assert
    expect(mockSharpInstance.blur).toHaveBeenCalledTimes(1);
    expect(filter.name).toBe('blur');
    expect(filter.value).toBeDefined();
  });

  it('should apply sharpen filter correctly', () => {
    // Arrange
    const mockSharpInstance = { sharpen: jest.fn().mockReturnThis() } as unknown as Sharp;

    // Act
    const filter = (service as any).sharpen();
    filter.applyFilter(mockSharpInstance);

    // Assert
    expect(mockSharpInstance.sharpen).toHaveBeenCalledTimes(1);
    expect(filter.name).toBe('sharpen');
    expect(filter.value).toBeDefined();
  });

  it('should apply tint filter correctly', () => {
    // Arrange
    const mockSharpInstance = { tint: jest.fn().mockReturnThis() } as unknown as Sharp;

    // Act
    const filter = (service as any).tint();
    filter.applyFilter(mockSharpInstance);

    // Assert
    expect(mockSharpInstance.tint).toHaveBeenCalledTimes(1);
    expect(filter.name).toBe('tint');
    expect(filter.value).toHaveProperty('r');
    expect(filter.value).toHaveProperty('g');
    expect(filter.value).toHaveProperty('b');
  });

  it('should generate random integers within the range', () => {
    // Act
    const randomValue = (service as any).randomInt(0, 10);

    // Assert
    expect(randomValue).toBeGreaterThanOrEqual(0);
    expect(randomValue).toBeLessThanOrEqual(10);
  });
});
