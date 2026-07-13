-- CreateTable
CREATE TABLE "signup_token" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "signup_token_token_key" ON "signup_token"("token");
