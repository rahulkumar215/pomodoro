import express, { Router, Response, Request } from "express";
import authRoutes from "./auth";
import taskRoutes from "./tasks";
import projectRoutes from "./projects";
import sessionRoutes from "./sessions";
import settingRoutes from "./settings";
import paymentRoutes from "./payments";
import webhookRoutes from "./webhooks";
import planRoutes from "./plan";

const v1: Router = express.Router();

v1.use("/auth", authRoutes);
v1.use("/tasks", taskRoutes);
v1.use("/projects", projectRoutes);
v1.use("/sessions", sessionRoutes);
v1.use("/plans", planRoutes);
v1.use("/settings", settingRoutes);
v1.use("/payments", paymentRoutes);
v1.use("/webhooks", webhookRoutes);

export default v1;
