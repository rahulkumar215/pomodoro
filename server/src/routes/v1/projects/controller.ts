import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createProjectSchema, updateProjectSchema } from "./projectsSchema";
import { ValidationError } from "@/errors";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = createProjectSchema.safeParse(req.body);

  if (!result.success) {
    console.log(result.error);
    throw new ValidationError("Invalid create payload.");
  }

  const { name, color } = result.data;

  const project = await prisma.project.create({
    data: {
      name: name,
      color: color,
      userId: req.user.id,
    },
  });

  res.status(200).json({
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
    where: {
      userId: req.user.id,
    },
    omit: {
      userId: true,
    },
  });

  res.status(StatusCodes.OK).json({
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

  if (!id || Array.isArray(id)) return next(new Error("Project id not found!"));

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      data: project,
    },
  });
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  if (!id || Array.isArray(id))
    throw new ValidationError("Project id not found!");

  const result = updateProjectSchema.safeParse(req.body);

  if (!result.success) throw new ValidationError("Invalid update payload.");

  const data = result.data;

  const project = await prisma.project.update({
    where: {
      id,
    },
    data,
  });

  res.status(200).json({
    status: "success",
    data: {
      project,
    },
  });
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || Array.isArray(id))
    throw new ValidationError("Project id not found.");

  await prisma.project.delete({
    where: {
      id,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Successfully project deleted",
  });
};

export const listProjectTasks = (req: Request, res: Response) => {
  res.status(200).json([]);
};
