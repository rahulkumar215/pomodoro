import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";
import * as sessionController from "./controller";
import { validateData } from "@/middleware/validationMiddleware";
import { createSessionSchema } from "./sessionSchema";

const session = Router();

session.use(authMiddleware);
session.post(
  "/",
  validateData(createSessionSchema),
  sessionController.createSession,
);
session.get("/", sessionController.getSessions);

export default session;
