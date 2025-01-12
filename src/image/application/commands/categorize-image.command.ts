import { Image } from '@prisma/client';

export class CategorizeImageCommand {
  constructor(
    public readonly image: Image,
  ) {}
} 
