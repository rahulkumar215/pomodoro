-- CreateTable
CREATE TABLE "otp_token" (
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "otp_expiry" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_token_otp_key" ON "otp_token"("otp");
