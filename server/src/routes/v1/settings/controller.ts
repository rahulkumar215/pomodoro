import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { settingsSchema } from "./settingsSchema";

export const createSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const settingsData = settingsSchema.parse(req.body);

  const settings = prisma.settings.create({
    data: {
      ...settingsData,
      user_id: req.user.id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      data: settings,
    },
  });
};

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const settings = await prisma.settings.findFirst({
    where: {
      user_id: req.user.id,
    },
  });

  res.status(StatusCodes.OK).json({
    settings,
  });
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const settingsData = settingsSchema.parse(req.body);

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
    omit: {
      id: true,
      user_id: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.status(StatusCodes.CREATED).json({
    settings,
  });
};
