import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, Jwt } from "jsonwebtoken";
import { prisma } from "../db";
import appConfig from "@/config";
import { UnauthorizedError, ValidationError } from "@/errors";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];

  try {
    if (token) {
      // use this docs : https://www.npmjs.com/package/jsonwebtoken when you come back to make the code good
      const decoded = jwt.verify(token, appConfig.JWT_SECRET);

      if (typeof decoded !== "object" || !("email" in decoded))
        throw new Error("Invalid Token");

      const user = await prisma.user.findFirst({
        where: {
          email: decoded.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          is_verified: true,
        },
      });

      if (!user) throw new ValidationError("User does not exist");

      req.user = user;
      next();
    } else {
      throw new Error("Token not found!");
    }
  } catch (error: any) {
    throw new UnauthorizedError(error.message);
  }
}
