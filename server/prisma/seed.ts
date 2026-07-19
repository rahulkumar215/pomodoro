// prisma/seed.ts
//
// Seeds the database with two users — a personal account and the public demo
// account — plus 320 pomodoro sessions each, spread over the last ~60 days so
// dashboard charts/aggregations have something realistic to render. Users and
// pomodoro sessions only: no breaks, plans, projects, tasks or settings.
//
// Settings are deliberately left unseeded. The client falls back to its own
// DEFAULT_SETTINGS and PATCH /settings upserts, so a user without a settings
// row behaves exactly like a freshly signed-up one.
//
// Run with:  tsx prisma/seed.ts
// or wire it up as the official Prisma seed command (see notes at bottom).

import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Prisma,
  Auth_Providers,
  Session_Types,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------- helpers ----------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinLastNDays(days: number): Date {
  const now = Date.now();
  const past = now - randInt(0, days) * 24 * 60 * 60 * 1000;
  // randomize time-of-day too, biased towards working hours (8am - 10pm)
  const d = new Date(past);
  d.setHours(randInt(8, 22), randInt(0, 59), 0, 0);
  return d;
}

const POMODORO_MINUTES = 25;

// ---------- main ----------

async function main() {
  console.log("Clearing existing users and their data...");
  // No relation in the schema declares onDelete: Cascade, so every table that
  // references user must be cleared before user itself or the delete is
  // rejected. These stay even though the seed no longer creates them.
  //
  // plan is intentionally NOT cleared: it is reference data read by GET /plan
  // and the Razorpay checkout flow, and nothing here recreates it.
  await prisma.session.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating user (Rahul)...");
  // Hash the password the same way the signup route does (bcrypt, 10 rounds).
  const hashedPassword = await bcrypt.hash("India@83029014", 10);
  const user = await prisma.user.create({
    data: {
      name: "Rahul",
      email: "rk83029014@gmail.com",
      password: hashedPassword,
      auth_provider: Auth_Providers.email,
      is_verified: true,
      is_premium: true,
    },
  });

  // Public demo account. Its credentials are displayed on the sign-in page so
  // visitors can try the app without going through email verification, so it
  // must stay separate from any real account.
  console.log("Creating public demo user...");
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@pomodoro.test",
      password: await bcrypt.hash("DemoPomodoro@2026", 10),
      auth_provider: Auth_Providers.email,
      is_verified: true,
      is_premium: true,
    },
  });

  console.log("Creating 320 pomodoro sessions per user...");
  const SESSION_COUNT = 320;

  const sessionData: Prisma.SessionCreateManyInput[] = [];
  for (const seededUser of [user, demoUser]) {
    for (let i = 0; i < SESSION_COUNT; i++) {
      const startTime = randomDateWithinLastNDays(60);
      const endTime = new Date(
        startTime.getTime() + POMODORO_MINUTES * 60 * 1000,
      );

      sessionData.push({
        type: Session_Types.pomodoro, // breaks are not seeded
        startTime,
        endTime,
        minutes: POMODORO_MINUTES,
        taskId: null, // no tasks in this seed — all sessions are freestanding
        userId: seededUser.id,
        createdAt: startTime,
      });
    }
  }

  // createMany is much faster than looping .create() for bulk inserts
  await prisma.session.createMany({ data: sessionData });

  const totalSessions = await prisma.session.count();
  console.log(
    `Done. Seeded 2 users (${user.email}, ${demoUser.email}) and ${totalSessions} sessions.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
