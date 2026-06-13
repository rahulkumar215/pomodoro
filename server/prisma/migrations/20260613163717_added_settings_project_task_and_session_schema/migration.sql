/*
  Warnings:

  - You are about to drop the column `photo` on the `user` table. All the data in the column will be lost.
  - The `auth_provider` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[google_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Auth_Providers" AS ENUM ('email', 'google');

-- CreateEnum
CREATE TYPE "Session_Types" AS ENUM ('pomodoro', 'short_break', 'long_break');

-- CreateEnum
CREATE TYPE "Hour_Formats" AS ENUM ('h24', 'h12');

-- CreateEnum
CREATE TYPE "Reminder_Types" AS ENUM ('every', 'last');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "photo",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "password" DROP NOT NULL,
DROP COLUMN "auth_provider",
ADD COLUMN     "auth_provider" "Auth_Providers" NOT NULL DEFAULT 'email';

-- DropEnum
DROP TYPE "Auth_Proiders";

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "estimated_pomodoros" INTEGER NOT NULL DEFAULT 1,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "project_id" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "type" "Session_Types" NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER NOT NULL,
    "task_id" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pomodoro_duration" INTEGER NOT NULL,
    "short_break_duration" INTEGER NOT NULL,
    "long_break_duration" INTEGER NOT NULL,
    "long_break_interval" INTEGER NOT NULL,
    "auto_start_breaks" BOOLEAN NOT NULL DEFAULT false,
    "auto_start_pomodoros" BOOLEAN NOT NULL DEFAULT false,
    "auto_check_tasks" BOOLEAN NOT NULL DEFAULT false,
    "check_to_bottom" BOOLEAN NOT NULL DEFAULT false,
    "alarm_sound" TEXT NOT NULL,
    "alarm_sound_repeat" INTEGER NOT NULL,
    "alarm_sound_volume" INTEGER NOT NULL,
    "focus_sound" TEXT NOT NULL,
    "focus_sound_volume" INTEGER NOT NULL,
    "pomodoro_theme" TEXT NOT NULL,
    "short_break_theme" TEXT NOT NULL,
    "long_break_theme" TEXT NOT NULL,
    "hour_format" "Hour_Formats" NOT NULL,
    "dark_mode_when_running" BOOLEAN NOT NULL DEFAULT false,
    "reminder_type" "Reminder_Types" NOT NULL,
    "reminder_time" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_user_id_key" ON "settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
