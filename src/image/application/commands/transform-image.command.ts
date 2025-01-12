export class TransformImageCommand {
  constructor(
    public readonly imagePath: string,
    public readonly imageName: string,
    public readonly watermarkText: string,
    public readonly imageId: number
  ) {}
} 