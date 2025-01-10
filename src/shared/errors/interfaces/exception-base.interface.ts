export interface ExceptionBaseArgs {
  message?: string;
  identifier?: string;
  cause?: Error | unknown;
  metadata?: unknown;
  traceId?: string;
}

// in case proper error tracking should be implemented. Ex: datadog etc.