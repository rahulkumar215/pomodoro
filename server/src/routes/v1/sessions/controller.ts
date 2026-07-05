import { prisma } from "@/db";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { type, startTime, endTime, taskId } = req.body;

  const minutes = Math.floor(
    (new Date(endTime) - new Date(startTime)) / 1000 / 60,
  );

  const session = await prisma.session.create({
    data: {
      type,
      start_time: startTime,
      end_time: endTime,
      minutes,
      task_id: taskId,
      user_id: req.user.id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      data: session,
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
      user_id: req.user.id,
    },
    omit: {
      user_id: true,
    },
  });

  res.status(StatusCodes.OK).json({
    sessions,
  });
};
