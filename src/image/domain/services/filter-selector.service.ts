import { Sharp } from 'sharp';

export type FilterOption = {
  name: string;
  applyFilter: (sharp: Sharp) => void;
  value?: unknown;
};

export class FilterSelectorService {
  getRandomFilter(): FilterOption {
    const filters: (() => FilterOption)[] = [
      this.greyScale,
      this.blur,
      this.sharpen,
      this.tint,
    ];

    const randomFilter = filters[Math.floor(Math.random() * filters.length)];
    return randomFilter();
  }

  private greyScale(): FilterOption {
    return {
      name: 'greyscale',
      applyFilter: (img: Sharp) => img.greyscale(),
    };
  }

  private blur(): FilterOption {
    const value = Math.random() * 5;
    return {
      name: 'blur',
      applyFilter: (img: Sharp) => img.blur(value),
      value,
    };
  }

  private sharpen(): FilterOption {
    const value = { sigma: Math.random() * 2 + 1 };
    return {
      name: 'sharpen',
      applyFilter: (img: Sharp) => img.sharpen(value),
      value,
    };
  }

  private tint(): FilterOption {
    const value = {
      r: this.randomInt(0, 255),
      g: this.randomInt(0, 255),
      b: this.randomInt(0, 255),
    };
    return {
      name: 'tint',
      applyFilter: (img: Sharp) => img.tint(value),
      value,
    };
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
