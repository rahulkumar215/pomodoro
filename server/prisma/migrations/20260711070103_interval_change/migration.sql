/*
  Warnings:

  - The values [infinite] on the enum `Interval` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Interval_new" AS ENUM ('month', 'year', 'lifetime');
ALTER TABLE "plan" ALTER COLUMN "interval" TYPE "Interval_new" USING ("interval"::text::"Interval_new");
ALTER TYPE "Interval" RENAME TO "Interval_old";
ALTER TYPE "Interval_new" RENAME TO "Interval";
DROP TYPE "public"."Interval_old";
COMMIT;
