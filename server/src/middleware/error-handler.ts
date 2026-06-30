import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import config from "../config";
import { AppError } from "@/errors/appError";

const sendErrorDev = (err: unknown, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    statck: err.stack,
  });
};

const sendErrorProd = (err: unknown, res: Response) => {
  if (err.isOperational) {
    // technically it should be logged here, so implement a logger later on
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && err.details),
    });
  } else {
    console.log("ERROR 💥", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = (err instanceof AppError && err.statusCode) || 500;
  err.status = (err instanceof AppError && err.statusCode) || "error";

  if (config.env === "development") {
    sendErrorDev(err, res);
  } else if (config.env === "production") {
    sendErrorProd(err, res);
  }
};

export default globalErrorHandler;
