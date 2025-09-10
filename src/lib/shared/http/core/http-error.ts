export class HttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

