/*
  Warnings:

  - Added the required column `token_expiry` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "token_expiry" TIMESTAMP(3) NOT NULL;
