import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createTaskSchema, updateTaskSchema } from "./taskSchema";
import { NotFoundError, ValidationError } from "@/errors";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body;

  const lastTask = await prisma.task.findFirst({
    where: { userId: req.user.id },
    orderBy: {
      order: "desc",
    },
  });

  const newOrder = lastTask ? lastTask.order.plus(1000) : 1000;

  const task = await prisma.task.create({
    data: {
      ...data,
      order: newOrder,
      userId: req.user.id,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: {
      task,
    },
  });
};

export const listTasks = async (req: Request, res: Response) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.user.id, deletedAt: null },
    include: { project: true },
    omit: { userId: true },
    orderBy: { order: "asc" },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    results: tasks.length,
    data: {
      tasks,
    },
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

  const data = req.body;

  try {
    await prisma.task.update({
      where: { id, userId: req.user.id, deletedAt: null },
      data,
    });

    res.status(StatusCodes.OK).json({
      message: "Successfully updated task.",
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Task", id);
    }
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

  try {
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
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Task", id);
    }
    throw error;
  }
};
