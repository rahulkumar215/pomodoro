import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";
import * as setttingsController from "./controller";
import { validateData } from "@/middleware/validationMiddleware";
import { createSettingsSchema, updateSettingsSchema } from "./settingsSchema";

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
  validateData(updateSettingsSchema),
  setttingsController.updateSettings,
);

export default settings;
