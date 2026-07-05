import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createTaskSchema, updateTaskSchema } from "./taskSchema";
import { NotFoundError, ValidationError } from "@/errors";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    throw new ValidationError("Invalid values provided");
  }

  const task = await prisma.task.create({
    data: {
      ...result.data,
      userId: req.user.id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      data: task,
    },
  });
};

export const listTasks = async (req: Request, res: Response) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    omit: {
      userId: true,
    },
  });

  res.status(StatusCodes.OK).json({
    tasks,
  });
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new ValidationError("Task id not found.");
  }

  const userId = req.user.id;
  const result = updateTaskSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError("Invalid update payload");
  }

  const data = result.data;

  try {
    await prisma.task.update({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      data,
    });

    res.status(StatusCodes.CREATED).json({
      message: "Successfully updated task.",
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new NotFoundError("Task", id);
    }
    console.log(error);
    throw error;
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new ValidationError("Task does not exits");
  }

  await prisma.task.delete({
    where: {
      id,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Successfully deleted task.",
  });
};

export const getTask = (req: Request, res: Response) => {
  res.status(200).json({ id: 1, name: "Task 1" });
};
