import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "@/db";
import config from "@/config";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const hasedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: "Pomodoro User",
      email: email,
      password: hasedPassword,
    },
  });

  res.json({
    message: "You are signed up!",
    data: {
      user: user,
    },
  });
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
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

    res.send({
      token,
    });
  }
};

export const me = (req: Request, res: Response) => {
  const user = req.user;

  if (user) {
    res.send({
      name: user.name,
      email: user.email,
      photo: user.photo,
      isVerified: user.is_verified,
    });
  } else {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
};
