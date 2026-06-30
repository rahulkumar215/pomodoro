// errors/index.js

import { AppError } from "./appError";
import { StatusCodes } from "http-status-codes";

export class BadRequestError extends AppError {
  constructor(message: "Bad request") {
    super(message, {
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: "Forbidden") {
    super(message, {
      statusCode: 403,
      code: "FORBIDDEN",
    });
  }
}

export class ValidationError extends AppError {
  public readonly details?: Record<string, string[]>;
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, {
      statusCode: StatusCodes.BAD_REQUEST,
      code: "VALIDATION_ERROR",
      isOperational: true,
    });
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} ${id} not found`, {
      statusCode: 404,
      code: "NOT_FOUND",
      isOperational: true,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, {
      statusCode: 401,
      code: "UNAUTHORIZED",
      isOperational: true,
    });
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;
  constructor(service: string, cause: unknown) {
    super(`Upstream service ${service} failed`, {
      statusCode: 502,
      code: "UPSTREAM_FAILURE",
      isOperational: true,
      cause,
    });
    this.service = service;
  }
}
