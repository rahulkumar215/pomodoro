import express, { Router } from "express";
import * as projectController from "./controller";
import { authMiddleware } from "@/middleware/auth";
import { validateData } from "@/middleware/validationMiddleware";
import { createProjectSchema, updateProjectSchema } from "./projectsSchema";

const projects: Router = express.Router();

projects.use(authMiddleware);

projects.post(
  "/",
  validateData(createProjectSchema),
  projectController.createProject,
);
projects.get("/", projectController.listProjects);
projects.get("/:id", projectController.getProject);
projects.patch(
  "/:id",
  validateData(updateProjectSchema),
  projectController.updateProject,
);
projects.delete("/:id", projectController.deleteProject);

export default projects;
