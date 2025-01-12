import { Image } from '@prisma/client';

export class DetectImageCommand {
  constructor(
    public readonly image: Image,
  ) {}
} 