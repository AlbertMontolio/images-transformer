import { Sharp } from 'sharp';

export type FilterOption = {
  name: string;
  applyFilter: (sharp: Sharp) => Sharp;
  value?: unknown;
};

export class FilterSelectorService {
  private readonly filters: (() => FilterOption)[];

  constructor() {
    this.filters = [
      () => this.greyScale(),
      () => this.blur(),
      () => this.sharpen(),
      () => this.tint(),
    ];
  }

  getRandomFilter(): FilterOption {
    const randomIndex = Math.floor(Math.random() * this.filters.length);
    return this.filters[randomIndex]();
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
    const value = { sigma: Math.random() * (1000 - 0.3) + 0.3 }; // Ensures sigma is between 0.3 and 1000

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
