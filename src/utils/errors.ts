/**
 * Base Application Error class mapping internal statuses.
 */
export class AppError extends Error {
  public statusCode?: string | number;
  public details?: any;

  constructor(message: string, statusCode?: string | number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;

    // Fix prototype chain for extended Error in TS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
