import { prisma } from "@/db";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { createSessionSchema } from "./sessionSchema";
import { ValidationError } from "@/errors";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = createSessionSchema.safeParse(req.body);

  if (!result.success) {
    console.log(result.error);
    throw new ValidationError("Invalid craete payload");
  }

  const data = result.data;

  const session = await prisma.session.create({
    data: {
      ...data,
      userId: req.user.id,
    },
  });

  res.status(StatusCodes.CREATED).json({
    message: "Successfully session created.",
    data: {
      session,
    },
  });
};

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sessions = await prisma.session.findMany({
    where: {
      userId: req.user.id,
    },
    omit: {
      userId: true,
    },
  });

  res.status(StatusCodes.OK).json({
    sessions,
  });
};
