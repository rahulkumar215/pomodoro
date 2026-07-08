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

  const lastTask = await prisma.task.findFirst({
    where: { userId: req.user.id },
    orderBy: {
      order: "desc",
    },
  });

  const newOrder = lastTask ? lastTask.order.plus(1000) : 1000;

  const task = await prisma.task.create({
    data: {
      ...result.data,
      order: newOrder,
      userId: req.user.id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
};

export const listTasks = async (req: Request, res: Response) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
      deletedAt: null,
    },
    include: {
      project: true,
    },
    omit: {
      userId: true,
    },
    orderBy: {
      order: "asc",
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

  await prisma.task.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Successfully deleted task.",
  });
};

export const getTask = (req: Request, res: Response) => {
  res.status(200).json({ id: 1, name: "Task 1" });
};
