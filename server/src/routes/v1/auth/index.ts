// v1.post("/signup", async (req: Request, res: Response) => {});
import { auth } from "@/middleware/auth";
import * as authController from "./controller";
import { Router } from "express";

const router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/me", auth, authController.me);

export default router;
