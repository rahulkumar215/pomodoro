import appConfig from "@/config";
import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";
import Razorpay from "razorpay";

export const razorPay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature || Array.isArray(webhookSignature))
      return res.status(401).send("Invalid signature format");

    const secret = appConfig.RAZORPAY_WEBHOOK_SECRET;
    const isValid = Razorpay.validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      secret,
    );

    if (!isValid) {
      console.error("Signature verification failed!");
      return res.status(401).send("Invalid signature");
    }

    const payload = req.body;
    const eventType = payload?.event;

    switch (eventType) {
      case "subscription.charged": {
        // TODO: Upgrade user to premium using payload.payload.subscription.entity.notes.app_user_id
        console.log("Upgrading user to premium...");
        const subEntity = payload?.payload?.subscription?.entity;
        const userId = subEntity.notes.app_user_id;
        const expiryDate = new Date(subEntity.current_end * 1000);
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            is_premium: true,
            razorpay_customer_id: subEntity.customer_id,
            plan_id: subEntity.plan_id,
            subscription_id: subEntity.id,
            premium_expires_at: expiryDate,
          },
        });
        console.log(`Successfully upgraded user: ${userId}`);
        break;
      }

      case "order.paid": {
        console.log("Upgrading user to premium...");
        const orderEntity = payload.payload.order.entity;
        const userId = orderEntity.notes.app_user_id;

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            is_premium: true,
            subscription_id: orderEntity.id,
            plan_id: orderEntity.plan_id,
            premium_expires_at: new Date("2099-12-31"),
          },
        });
        console.log(`Successfully upgraded user: ${userId}`);
        break;
      }

      case "subscription.halted":
      case "subscription.completed": {
        console.log("Downgrading user account...");
        const subEntity = payload?.payload?.subscription?.entity;
        const userId = subEntity.notes.app_user_id;

        await prisma.user.update({
          where: { id: userId },
          data: {
            is_premium: false,
            razorpay_customer_id: "",
            plan_id: "",
            subscription_id: "",
            premium_expires_at: "",
          },
        });

        console.log(`Successfully upgraded user: ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error handling webhook:", error);
    // If headers haven't been sent yet, send a 500 error
    if (!res.headersSent) {
      throw error;
    }
  }
};
