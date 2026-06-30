/*
  Warnings:

  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "autorenew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premium_expires_at" TIMESTAMP(3),
ADD COLUMN     "razorpay_customer_id" TEXT,
ADD COLUMN     "subscription_id" TEXT,
ALTER COLUMN "password" SET NOT NULL;
