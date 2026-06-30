// v1.post("/signup", async (req: Request, res: Response) => {});
import { authMiddleware } from "@/middleware/auth";
import * as authController from "./controller";
import { Router } from "express";
import { validateData } from "@/middleware/validationMiddleware";
import { signupSchema } from "./authSchemas";

const router = Router();

router.post("/signup", validateData(signupSchema), authController.signup);
router.post("/signin", authController.signin);
router.get("/me", authMiddleware, authController.me);

export default router;
