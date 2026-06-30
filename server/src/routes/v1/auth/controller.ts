import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "@/db";
import config from "@/config";
import jwt from "jsonwebtoken";
import { ValidationError } from "@/errors";
import { Prisma } from "@/generated/prisma/client";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password, confirmPassword } = req.body;

  if (confirmPassword !== password) {
    throw new ValidationError("Passwords do not match");
  }

  try {
    const hasedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Pomodoro User",
        email: email,
        password: hasedPassword,
      },
    });

    res.status(200).json({
      message: "You are signed up!",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ValidationError("User already exists.");
    }

    throw error;
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        name: true,
        avatar_url: true,
        password: true,
        email: true,
      },
    });

    if (!user) {
      res.status(400).json({
        message: "User does not exist.",
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign(
        {
          email: user.email,
        },
        config.jwt_secret,
        {
          expiresIn: "24h",
        },
      );

      res.status(200).json({
        token,
        user: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const me = (req: Request, res: Response) => {
  const user = req.user;

  if (user) {
    res.send({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      isVerified: user.is_verified,
    });
  } else {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
};
