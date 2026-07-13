-- AlterTable
ALTER TABLE "token" ADD COLUMN     "replacedBy" TEXT,
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;
