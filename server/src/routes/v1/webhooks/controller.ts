import config from "@/config";
import { prisma } from "@/db";
import { NextFunction, Request, Response } from "express";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

export const razorPay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("Webhook event received.");

    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature || Array.isArray(webhookSignature))
      return res.status(401).send("Invalid signature format");

    const secret = config.RAZORPAY_WEBHOOK_SECRET || "infini8";
    const isValid = validateWebhookSignature(
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

    console.log(`Processing verfied event : ${eventType}`);
    console.log(`with respected payload : ${payload}`);

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
      case "subscription.completed":
        // TODO: Downgrade user using payload.payload.subscription.entity.id
        console.log("Downgrading user account...");
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error handling webhook:", error);
    // If headers haven't been sent yet, send a 500 error
    if (!res.headersSent) {
      return res.status(500).send("Internal server error");
    }
  }
};

// Subscription Body {
//   entity: {
//     id: 'sub_T7GxGn50fq1EEi',
//     entity: 'subscription',
//     plan_id: 'plan_T7Fz3v0j92fNhO',
//     customer_id: 'cust_T6MtE9F0ysmQ9w',
//     customer_email: 'abc@example.com',
//     customer_contact: '+919319444628',
//     status: 'completed',
//     current_start: 1782698024,
//     current_end: 1785263400,
//     ended_at: 1782698024,
//     quantity: 1,
//     notes: { app_user_id: '5553388a-7aad-4ee5-b11e-f84c3886ab7f' },
//     charge_at: null,
//     start_at: 1782698024,
//     end_at: 1782698024,
//     auth_attempts: 0,
//     total_count: 1,
//     paid_count: 1,
//     customer_notify: true,
//     created_at: 1782698003,
//     expire_by: null,
//     short_url: null,
//     has_scheduled_changes: false,
//     change_scheduled_at: null,
//     source: 'api',
//     payment_method: 'card',
//     offer_id: null,
//     halted_at: null,
//     remaining_count: 0
//   }
// }

// {
//   entity: 'event',
//   account_id: 'acc_T2LK5v6UMHJCQy',
//   event: 'subscription.activated',
//   contains: [ 'subscription', 'payment' ],
//   payload: { subscription: { entity: [Object] }, payment: { entity: [Object] } },
//   created_at: 1782697570
// }
// {
//   entity: 'event',
//   account_id: 'acc_T2LK5v6UMHJCQy',
//   event: 'subscription.completed',
//   contains: [ 'subscription', 'payment' ],
//   payload: { subscription: { entity: [Object] }, payment: { entity: [Object] } },
//   created_at: 1782697570
// }
// {
//   entity: 'event',
//   account_id: 'acc_T2LK5v6UMHJCQy',
//   event: 'subscription.authenticated',
//   contains: [ 'subscription' ],
//   payload: { subscription: { entity: [Object] } },
//   created_at: 1782697570
// }
// {
//   entity: 'event',
//   account_id: 'acc_T2LK5v6UMHJCQy',
//   event: 'subscription.charged',
//   contains: [ 'subscription', 'payment' ],
//   payload: { subscription: { entity: [Object] }, payment: { entity: [Object] } },
//   created_at: 1782697570
// }
