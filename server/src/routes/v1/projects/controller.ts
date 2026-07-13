import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, ValidationError } from "@/errors";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body;
  const project = await prisma.project.create({
    data: {
      ...data,
      userId: req.user.id,
    },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      project,
    },
  });
};

export const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.user.id },
    omit: { userId: true },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    results: projects.length,
    data: {
      projects,
    },
  });
};

export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  if (!id || Array.isArray(id))
    throw new ValidationError("Project id not found.");

  try {
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        data: project,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Project", id);
    }

    throw error;
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  if (!id || Array.isArray(id))
    throw new ValidationError("Project id not found!");

  const data = req.body;

  try {
    await prisma.project.update({
      where: {
        id,
      },
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
      throw new NotFoundError("Project", id);
    }

    throw error;
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || Array.isArray(id))
    throw new ValidationError("Project id not found.");

  try {
    await prisma.project.delete({
      where: {
        id,
      },
    });

    res.status(StatusCodes.OK).json({
      message: "Successfully project deleted",
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Project", id);
    }

    throw error;
  }
};
