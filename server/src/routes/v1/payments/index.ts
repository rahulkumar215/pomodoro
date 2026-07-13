import { Router } from "express";
import * as paymentController from "./controller";
import { authMiddleware } from "@/middleware/auth";
import { validateData } from "@/middleware/validationMiddleware";
import { createOrderSchema } from "./paymentsSchema";

const payments = Router();

payments.use(authMiddleware);
payments.post(
  "/createOrder",
  validateData(createOrderSchema),
  paymentController.createOrder,
);
payments.post("/verifyPayment", paymentController.verifyPayment);
payments.post("/createSubscription", paymentController.createSubscription);
payments.post("/verifySubscription", paymentController.verifySubscription);

export default payments;
