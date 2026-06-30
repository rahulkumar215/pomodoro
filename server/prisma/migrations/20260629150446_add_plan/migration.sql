-- CreateEnum
CREATE TYPE "Interval" AS ENUM ('month', 'year', 'infinite');

-- CreateEnum
CREATE TYPE "Billing_Type" AS ENUM ('recurring', 'one_time');

-- CreateTable
CREATE TABLE "plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingType" "Billing_Type" NOT NULL,
    "interval" "Interval" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_id_key" ON "plan"("id");
