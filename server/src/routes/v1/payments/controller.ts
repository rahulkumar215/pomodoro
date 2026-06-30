import { NextFunction, Request, Response } from "express";
import { createRazorPayInstance } from "../razorypay/controller";
import crypto from "crypto";
import config from "@/config";

const razorPayInstance = createRazorPayInstance();

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Do not accept amount from client
  const { planId, amount } = req.body;

  // fetch the plan amount from the plan id

  const options = {
    amount: amount * 100,
    currency: "INR",
    notes: {
      app_user_id: req.user.id,
    },
  };

  try {
    razorPayInstance.orders.create(options, (err, order) => {
      if (err) {
        return res.status(500).json({
          status: "failed",
          message: "Something went wrong",
        });
      }

      res.header("Access-Control-Allow-Origin", "*");
      return res.status(200).json(order);
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Something went wrong",
    });
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { order_id, payment_id, signature } = req.body;

  // create hmac object
  const hmac = crypto.createHmac("sha256", config.razorpay_secret);

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
  console.log("Req Body", req.body);
  const subscription = await razorPayInstance.subscriptions.create({
    plan_id: req.body.planId,
    quantity: 1,
    total_count: 1,
    notes: {
      app_user_id: req.user.id,
    },
  });

  res.status(200).json({
    subscriptionId: subscription.id,
  });
};

export const verifySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { payment_id, subscription_id, signature } = req.body;
  const hmac = crypto.createHmac("sha256", config.razorpay_secret);
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
