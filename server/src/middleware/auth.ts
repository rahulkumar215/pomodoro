import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, Jwt } from "jsonwebtoken";
import config from "../config";
import { prisma } from "../db";

export async function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  try {
    if (token) {
      // use this docs : https://www.npmjs.com/package/jsonwebtoken when you come back to make the code good
      const decoded = jwt.verify(token, config.jwt_secret);

      if (typeof decoded !== "object" || !("email" in decoded))
        throw new Error("Invalid Token");

      const user = await prisma.user.findFirst({
        where: {
          email: decoded.email,
        },
      });

      if (!user) throw new Error("User does not exist");

      req.user = user;
      next();
    } else {
      throw new Error("Token not found!");
    }
  } catch (error: any) {
    res.status(401).send({
      message: error.message,
    });
  }
}
