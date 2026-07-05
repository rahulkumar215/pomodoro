import express, { Router } from "express";
import * as taskController from "./controller";
import { authMiddleware } from "@/middleware/auth";

const tasks: Router = express.Router();

tasks.use(authMiddleware);
tasks.post("/", taskController.createTask);
tasks.get("/", taskController.listTasks);
tasks.get("/:id", taskController.getTask);
tasks.patch("/:id", taskController.updateTask);
tasks.delete("/:id", taskController.deleteTask);

export default tasks;
