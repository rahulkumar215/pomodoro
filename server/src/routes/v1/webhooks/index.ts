import express, { Router } from "express";
import * as webhookController from "./controller";

const webhooks = Router();

webhooks.post(
  "/incoming",
  express.raw({ type: "application/json" }),
  webhookController.razorPay,
);

export default webhooks;
