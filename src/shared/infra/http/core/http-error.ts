import { HTTP_STATUS } from './status-codes';

export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === HTTP_STATUS.UNAUTHORIZED;
  }

  get hasDetails(): boolean {
    return typeof this.details !== 'undefined' && this.details !== null;
  }
}
