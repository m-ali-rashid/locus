/**
 * core/errors/AppError.ts
 *
 * Base error class for all domain and application errors.
 * Prefer throwing AppError (or a subclass) over raw Error objects
 * so we can attach a machine-readable code for handling at the boundary.
 */
export class AppError extends Error {
  /** Machine-readable error code — use SCREAMING_SNAKE_CASE */
  readonly code: string;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    if (cause instanceof Error) {
      this.cause = cause;
    }
    // Maintain proper stack trace in V8 environments (non-standard extension)
    if ((Error as unknown as Record<string, unknown>).captureStackTrace) {
      (Error as unknown as { captureStackTrace: (t: unknown, c: unknown) => void }).captureStackTrace(this, AppError);
    }
  }
}

// ─── Typed sub-errors ──────────────────────────────────────────────────────

export class PermissionError extends AppError {
  constructor(message: string) {
    super('PERMISSION_DENIED', message);
    this.name = 'PermissionError';
  }
}

export class LocationError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('LOCATION_ERROR', message, cause);
    this.name = 'LocationError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('STORAGE_ERROR', message, cause);
    this.name = 'StorageError';
  }
}
