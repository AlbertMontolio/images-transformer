export class SavePredictionError extends Error {
  cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'SavePredictionError';
    this.cause = cause;
  }
} 