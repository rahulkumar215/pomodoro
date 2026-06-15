import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, color } = req.body;

  // perform some validation here

  const project = await prisma.project.create({
    data: {
      name: name,
      color: color,
      user_id: req.user.id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      data: project,
    },
  });
};

export const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const projects = await prisma.project.findMany();
  res.status(200).json({
    status: "success",
    results: projects.length,
    data: {
      data: projects,
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

  if (!id || Array.isArray(id)) return next(new Error("Project id not found!"));

  const { name, color } = req.body;

  if (name === undefined && color === undefined)
    return next(new Error("No fields provided to update!"));

  const project = await prisma.project.update({
    where: {
      id,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      data: project,
    },
  });
};

export const deleteProject = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) return next(new Error("Project Id not found!"));

  prisma.project.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    status: "success",
  });
};

export const listProjectTasks = (req: Request, res: Response) => {
  res.status(200).json([]);
};
