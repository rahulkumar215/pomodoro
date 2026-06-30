interface AppErrorOptions {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  cause?: unknown;
}

export class AppError extends Error {
  public readonly statusCode;
  public readonly status;
  public readonly code;
  public readonly isOperational;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
    this.statusCode = options.statusCode ?? 500;
    this.status = `${options.statusCode}`.startsWith("4") ? "fail" : "error";
    this.code = options.code ?? "INTERNAL_ERROR";
    this.isOperational = options.isOperational ?? true;
    Error.captureStackTrace(this, new.target);
  }
}
