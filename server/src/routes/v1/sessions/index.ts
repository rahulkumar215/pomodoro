import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";
import * as sessionController from "./controller";

const session = Router();

session.use(authMiddleware);
session.post("/", sessionController.createSession);
session.get("/", sessionController.getSessions);

export default session;
