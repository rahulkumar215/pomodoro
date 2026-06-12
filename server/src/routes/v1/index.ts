import express, { Router, Response, Request } from "express";
import tasks from "./tasks";
import projects from "./projects";
import authRoutes from "./auth";

const v1: Router = express.Router();

v1.use("/tasks", tasks);
v1.use("/projects", projects);
v1.use("/auth", authRoutes);

export default v1;
