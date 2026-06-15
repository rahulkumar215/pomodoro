import express, { Router, Response, Request } from "express";
import authRoutes from "./auth";
import taskRoutes from "./tasks";
import projectRoutes from "./projects";
import sessionRoutes from "./sessions";

const v1: Router = express.Router();

v1.use("/auth", authRoutes);
v1.use("/tasks", taskRoutes);
v1.use("/projects", projectRoutes);
v1.use("/sessions", sessionRoutes);

export default v1;
