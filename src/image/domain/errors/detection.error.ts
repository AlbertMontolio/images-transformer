export class DetectionError extends Error {
  cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'DetectionError';
    this.cause = cause;
  }
} 