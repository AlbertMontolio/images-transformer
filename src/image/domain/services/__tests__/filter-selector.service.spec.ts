import { FilterSelectorService } from '../filter-selector.service';
import { Sharp } from 'sharp';

jest.mock('sharp');

type PrivateFilterSelectorService = {
  greyScale(): { name: string; applyFilter: (sharp: Sharp) => void };
  blur(): { name: string; applyFilter: (sharp: Sharp) => void; value: number };
  sharpen(): { name: string; applyFilter: (sharp: Sharp) => void; value: number };
  tint(): { 
    name: string; 
    applyFilter: (sharp: Sharp) => void; 
    value: { r: number; g: number; b: number } 
  };
  randomInt(min: number, max: number): number;
}

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
    const filter = (service as unknown as PrivateFilterSelectorService).greyScale();
    filter.applyFilter(mockSharpInstance);

    // Assert
    expect(mockSharpInstance.greyscale).toHaveBeenCalledTimes(1);
    expect(filter.name).toBe('greyscale');
  });

  it('should apply blur filter correctly', () => {
    // Arrange
    const mockSharpInstance = { blur: jest.fn().mockReturnThis() } as unknown as Sharp;

    // Act
    const filter = (service as unknown as PrivateFilterSelectorService).blur();
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
    const filter = (service as unknown as PrivateFilterSelectorService).sharpen();
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
    const filter = (service as unknown as PrivateFilterSelectorService).tint();
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
    const randomValue = (service as unknown as PrivateFilterSelectorService).randomInt(0, 10);

    // Assert
    expect(randomValue).toBeGreaterThanOrEqual(0);
    expect(randomValue).toBeLessThanOrEqual(10);
  });
});
