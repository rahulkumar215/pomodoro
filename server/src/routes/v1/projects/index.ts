import express, { Router } from "express";
import * as projectController from "./controller";
import { authMiddleware } from "@/middleware/auth";

const projects: Router = express.Router();

projects.use(authMiddleware);

projects.post("/", projectController.createProject);
projects.get("/", projectController.listProjects);
projects.get("/:id", projectController.getProject);
projects.patch("/:id", projectController.updateProject);
projects.delete("/:id", projectController.deleteProject);
projects.get("/:id/tasks", projectController.listProjectTasks);

export default projects;
