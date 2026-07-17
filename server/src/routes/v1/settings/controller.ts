import { prisma } from "@/db";
import { NotFoundError, ValidationError } from "@/errors";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const createSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const settingsData = req.body;

  try {
    const settings = prisma.settings.create({
      data: {
        ...settingsData,
        user_id: req.user.id,
      },
    });

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: { settings },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ValidationError("Cannot create two settings for one user.");
    }

    throw error;
  }
};

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await prisma.settings.findFirst({
      where: {
        user_id: req.user.id,
      },
    });

    if (!settings) throw new NotFoundError("Settings", req.user.id);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: { settings },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Settings", req.user.id);
    }

    throw error;
  }
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const settingsData = req.body;

  try {
    const settings = await prisma.settings.upsert({
      where: {
        user_id: req.user.id,
      },
      update: {
        ...settingsData,
      },
      create: {
        ...settingsData,
        user_id: req.user.id,
      },
    });

    res.status(StatusCodes.OK).json({
      message: "Successfully updated settings.",
      data: {
        settings,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Settings", req.user.id);
    }

    throw error;
  }
};
