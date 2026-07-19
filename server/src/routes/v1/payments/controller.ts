import { NextFunction, Request, Response } from "express";
import { createRazorPayInstance } from "../razorypay/controller";
import crypto from "crypto";
import { prisma } from "@/db";
import { NotFoundError } from "@/errors";
import { StatusCodes } from "http-status-codes";
import appConfig from "@/config";

const razorPayInstance = createRazorPayInstance();

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Do not accept amount from client
  const { planId } = req.body;

  // fetch the plan amount from the plan id
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) throw new NotFoundError("Plan", planId);

  const options = {
    amount: plan.price * 100,
    currency: "INR",
    notes: {
      app_user_id: req.user.id,
    },
  };

  razorPayInstance.orders.create(options, (err, order) => {
    if (err) {
      throw err;
    }
    res.header("Access-Control-Allow-Origin", "*");
    return res.status(StatusCodes.OK).json(order);
  });
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { order_id, payment_id, signature } = req.body;

  // create hmac object
  const hmac = crypto.createHmac("sha256", appConfig.RAZORPAY_SECRET);

  hmac.update(order_id + "|" + payment_id);

  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === signature) {
    // do some work here, like upgrading the user tier
    return res.status(200).json({
      status: "success",
      message: "Payment verified",
    });
  } else {
    return res.status(400).json({
      status: "success",
      message: "Payment not verified",
    });
  }
};

export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const subscription = await razorPayInstance.subscriptions.create({
    plan_id: req.body.planId,
    quantity: 1,
    total_count: 1,
    notes: {
      app_user_id: req.user.id,
    },
  });

  res.status(StatusCodes.OK).json({
    subscriptionId: subscription.id,
  });
};

export const verifySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { payment_id, subscription_id, signature } = req.body;
  const hmac = crypto.createHmac("sha256", appConfig.RAZORPAY_SECRET);
  hmac.update(payment_id + "|" + subscription_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === signature) {
    // do some work here, like upgrading the user tier
    return res.status(200).json({
      status: "success",
      message: "Subscription verified",
    });
  } else {
    return res.status(400).json({
      status: "success",
      message: "Subscription not verified",
    });
  }
};
