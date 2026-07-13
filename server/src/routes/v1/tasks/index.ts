import express, { Router } from "express";
import * as taskController from "./controller";
import { authMiddleware } from "@/middleware/auth";
import { validateData } from "@/middleware/validationMiddleware";
import { createTaskSchema, updateTaskSchema } from "./taskSchema";

const tasks: Router = express.Router();

tasks.use(authMiddleware);
tasks.get("/", taskController.listTasks);
tasks.post("/", validateData(createTaskSchema), taskController.createTask);
tasks.patch("/:id", validateData(updateTaskSchema), taskController.updateTask);
tasks.delete("/:id", taskController.deleteTask);

export default tasks;
