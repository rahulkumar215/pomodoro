// v1.post("/signup", async (req: Request, res: Response) => {});
import { authMiddleware } from "@/middleware/auth";
import * as authController from "./controller";
import { Router } from "express";
import { validateData } from "@/middleware/validationMiddleware";
import {
  forgetPasswordScehma,
  resetPasswordSchema,
  setPasswordSchema,
  signinSchema,
  signupSchema,
} from "./authSchemas";

const router = Router();

router.post("/signup", validateData(signupSchema), authController.signup);
router.post(
  "/set-password/:token",
  validateData(setPasswordSchema),
  authController.setPassword,
);
router.post("/signin", validateData(signinSchema), authController.signin);
router.post("/refresh", authController.refreshToken);
router.get("/me", authMiddleware, authController.me);
router.post(
  "/forgot-password",
  validateData(forgetPasswordScehma),
  authController.forgetPassword,
);
router.post(
  "/reset-password/:token",
  validateData(resetPasswordSchema),
  authController.resetPassword,
);
router.post("/logout", authController.logout);

export default router;
