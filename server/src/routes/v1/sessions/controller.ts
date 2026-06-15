import { prisma } from "@/db";
import { Request, Response, NextFunction } from "express";

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
