import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";
import * as setttingsController from "./controller";

const settings = Router();

settings.use(authMiddleware);
settings.post("/", setttingsController.createSettings);
settings.get("/", setttingsController.getSettings);
settings.patch("/", setttingsController.updateSettings);

export default settings;
