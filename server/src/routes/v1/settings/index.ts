import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";
import * as setttingsController from "./controller";
import { validateData } from "@/middleware/validationMiddleware";
import { createSettingsSchema } from "./settingsSchema";
import { updateSessionSchema } from "../sessions/sessionSchema";

const settings = Router();

settings.use(authMiddleware);
settings.post(
  "/",
  validateData(createSettingsSchema),
  setttingsController.createSettings,
);
settings.get("/", setttingsController.getSettings);
settings.patch(
  "/",
  validateData(updateSessionSchema),
  setttingsController.updateSettings,
);

export default settings;
