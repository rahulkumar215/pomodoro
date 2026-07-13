import { prisma } from "@/db";
import { NextFunction, Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";

const plans = Router();

plans.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const plans = await prisma.plan.findMany({
    orderBy: {
      price: "asc",
    },
  });

  res.status(StatusCodes.OK).json({
    data: {
      plans,
    },
  });
});

export default plans;
