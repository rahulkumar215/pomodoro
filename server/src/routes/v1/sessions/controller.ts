import { prisma } from "@/db";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { createSessionSchema } from "./sessionSchema";
import { ValidationError } from "@/errors";

function longestDateStreak(dateStrings: string[]) {
  if (dateStrings.length === 0) return 0;

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  // 1. Convert all dates to a unique set of integers (days since epoch)
  const daySet = new Set(
    dateStrings.map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0); // Strip out time variations
      return Math.floor(date.getTime() / MS_PER_DAY);
    }),
  );

  let maxStreak = 0;

  // 2. Run the O(N) streak finder
  for (const day of daySet) {
    // If (day - 1) is missing, this day is the beginning of a streak
    if (!daySet.has(day - 1)) {
      let currentDay = day;
      let currentStreak = 1;

      while (daySet.has(currentDay + 1)) {
        currentDay += 1;
        currentStreak += 1;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
    }
  }

  return maxStreak;
}

function removeDuplicatesInPlace(daysUsed: string[]) {
  if (daysUsed.length === 0) return [];

  daysUsed.sort((a, b) => a - b);

  let i = 0; // Pointer for the last known unique element

  for (let j = 1; j < daysUsed.length; j++) {
    if (daysUsed[j] !== daysUsed[i]) {
      i++;
      daysUsed[i] = daysUsed[j]; // Move unique element forward
    }
  }
  // Cut the array array to its unique length
  daysUsed.length = i + 1;
  return daysUsed;
}

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body;

  const session = await prisma.session.create({
    data: {
      ...data,
      userId: req.user.id,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: {
      session,
    },
  });
};

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, take } = req.query;

  const aggregations = await prisma.session.aggregate({
    where: {
      userId: req.user.id,
    },
    _count: true,
    _sum: {
      minutes: true,
    },
  });

  const allSessions = await prisma.session.findMany({
    where: {
      userId: req.user.id,
    },
  });

  const sessions = await prisma.session.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
    omit: {
      userId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: Number(page) * Number(take),
    take: Number(take),
  });

  const daysUsed = allSessions.map((session) =>
    new Date(session.startTime).toDateString(),
  );

  const uniqueDaysAccessed = removeDuplicatesInPlace(daysUsed);
  const streakDays = longestDateStreak(uniqueDaysAccessed);

  res.status(StatusCodes.OK).json({
    status: "success",
    result: sessions.length,
    daysAccessed: uniqueDaysAccessed.length,
    streakDays,
    hoursFocused: Math.round(Number(aggregations._sum.minutes) / 60),
    totalCount: aggregations._count,
    data: {
      sessions,
    },
  });
};
