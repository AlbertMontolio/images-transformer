import { Image } from '@prisma/client';

export class TransformImageCommand {
  constructor(
    public readonly image: Image,
    public readonly watermarkText: string
  ) {}
} 