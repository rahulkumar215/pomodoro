import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    name,
    estimatedPomodoros,
    projectId: project_id,
    note,
    order,
  } = req.body;

  const task = await prisma.task.create({
    data: {
      name,
      estimated_pomodoros: estimatedPomodoros,
      order,
      ...(project_id !== undefined && { project_id }),
      ...(note !== undefined && { note }),
      user_id: req.user.id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      data: task,
    },
  });
};

export const listTasks = (req: Request, res: Response) => {
  res.status(200).json([]);
};

export const getTask = (req: Request, res: Response) => {
  res.status(200).json({ id: 1, name: "Task 1" });
};
