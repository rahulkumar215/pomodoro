// prisma/seed.ts
//
// Seeds the database with a single user ("Rahul") and 320 sessions spread over
// the last ~60 days so dashboard charts/aggregations have something realistic
// to render. No projects and no tasks — sessions only.
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
  Hour_Formats,
  Reminder_Types,
  Billing_Type,
  Interval,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------- helpers ----------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function randomDateWithinLastNDays(days: number): Date {
  const now = Date.now();
  const past = now - randInt(0, days) * 24 * 60 * 60 * 1000;
  // randomize time-of-day too, biased towards working hours (8am - 10pm)
  const d = new Date(past);
  d.setHours(randInt(8, 22), randInt(0, 59), 0, 0);
  return d;
}

const SESSION_DURATIONS = {
  pomodoro: 25,
  short_break: 5,
  long_break: 15,
};

// ---------- main ----------

async function main() {
  console.log("Clearing existing data...");
  // Delete in FK-safe order
  await prisma.session.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.plan.deleteMany();

  console.log("Creating plans...");
  await prisma.plan.createMany({
    data: [
      {
        id: "plan_free",
        name: "Free",
        price: 0,
        billingType: Billing_Type.recurring,
        interval: Interval.infinite,
      },
      {
        id: "plan_pro_monthly",
        name: "Pro Monthly",
        price: 499,
        billingType: Billing_Type.recurring,
        interval: Interval.month,
      },
      {
        id: "plan_pro_yearly",
        name: "Pro Yearly",
        price: 4999,
        billingType: Billing_Type.recurring,
        interval: Interval.year,
      },
    ],
  });

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
      settings: {
        create: {
          pomodoro_duration: 25,
          short_break_duration: 5,
          long_break_duration: 15,
          long_break_interval: 4,
          auto_start_breaks: false,
          auto_start_pomodoros: false,
          auto_check_tasks: false,
          check_to_bottom: false,
          alarm_sound: "bell.mp3",
          alarm_sound_repeat: 1,
          alarm_sound_volume: 80,
          focus_sound: "rain.mp3",
          focus_sound_volume: 50,
          pomodoro_theme: "#EF4444",
          short_break_theme: "#22C55E",
          long_break_theme: "#3B82F6",
          hour_format: Hour_Formats.h24,
          dark_mode_when_running: true,
          reminder_type: Reminder_Types.every,
          reminder_time: 5,
        },
      },
    },
  });

  console.log("Creating 320 sessions...");
  const SESSION_COUNT = 320;
  const sessionTypeWeights: Session_Types[] = [
    ...Array(10).fill(Session_Types.pomodoro), // ~60% pomodoro
  ];

  const sessionData: Prisma.SessionCreateManyInput[] = [];
  for (let i = 0; i < SESSION_COUNT; i++) {
    const type = pick(sessionTypeWeights);
    const minutes = SESSION_DURATIONS[type];

    const startTime = randomDateWithinLastNDays(60);
    const endTime = new Date(startTime.getTime() + minutes * 60 * 1000);

    sessionData.push({
      type,
      startTime,
      endTime,
      minutes,
      taskId: null, // no tasks in this seed — all sessions are freestanding
      userId: user.id,
      createdAt: startTime,
    });
  }

  // createMany is much faster than looping .create() for bulk inserts
  await prisma.session.createMany({ data: sessionData });

  const totalSessions = await prisma.session.count();
  console.log(
    `Done. Seeded 1 user (${user.email}) and ${totalSessions} sessions.`,
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
