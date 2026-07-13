import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto, { BinaryToTextEncoding } from "crypto";
import { prisma } from "@/db";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ValidationError } from "@/errors";
import sendEmail from "@/utils/email";
import { StatusCodes } from "http-status-codes";
import appConfig from "@/config";

function signAccessToken(email: string) {
  return jwt.sign({ email }, appConfig.JWT_SECRET, {
    expiresIn: appConfig.JWT_EXP as jwt.SignOptions["expiresIn"],
  });
}

function generateToken() {
  return crypto
    .randomBytes(Number(appConfig.TOKEN_LEN))
    .toString(appConfig.TOKEN_ENC as BufferEncoding); // opaque, not JWT
}

function hashToken(token: string) {
  return crypto
    .createHash(appConfig.TOKEN_ALGO)
    .update(token)
    .digest(appConfig.TOKEN_ENC as BinaryToTextEncoding);
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  const token = generateToken();

  await prisma.signupToken.create({
    data: {
      email,
      token: hashToken(token),
      tokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  sendEmail({
    email,
    subject: "Please set your password",
    html: `<h1>Please set Password</h1>
      <p>Click on the following link to set your password:</p>
      <a href="http://localhost:5173/set-password/${token}">http://localhost:5173/set-password</a>
      <p>The link will expire in 10 minutes.</p>`,
  });

  res.status(StatusCodes.OK).json({
    message: "Activation mail has been sent to you.",
  });
};

export const setPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { password, confirmPassword } = req.body;

  if (confirmPassword !== password) {
    throw new ValidationError("Passwords do not match");
  }

  const { token } = req.params;

  if (!token || Array.isArray(token))
    throw new ValidationError("Invalid token provided");

  const stored = await prisma.signupToken.findUnique({
    where: { token: hashToken(token) },
  });

  if (!stored || stored.tokenExpiry < new Date())
    throw new ValidationError("Signup token expired or invalid");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: "Pomodoro User",
      email: stored.email,
      password: hashedPassword,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "You have been signed up successfully.",
  });

  await prisma.signupToken.delete({
    where: { token: stored.token },
  });
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
    select: {
      id: true,
      name: true,
      avatar_url: true,
      password: true,
      email: true,
    },
  });

  if (!user) throw new ValidationError("User does not exists.");

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    const accessToken = signAccessToken(user.email);
    const refreshToken = generateToken();
    const hasedToken = hashToken(refreshToken);

    await prisma.token.create({
      data: {
        token: hasedToken,
        userId: user.id,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/v1/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({
      token: accessToken,
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
      },
    });
  } else {
    throw new ValidationError("Invalid email or password");
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) throw new ValidationError("User does not exist.");

  const existingTokens = await prisma.token.findMany({
    where: {
      userId: user.id,
    },
  });

  if (existingTokens) {
    await prisma.token.deleteMany({
      where: {
        userId: user.id,
      },
    });
  }

  const token = generateToken();
  const hashedToken = hashToken(token);

  await prisma.token.create({
    data: {
      userId: user.id,
      token: hashedToken,
      tokenExpiry: new Date(Date.now() + 5.5 * 60 * 60 * 1000 + 600000),
    },
  });

  sendEmail({
    email,
    subject: "Please reset your password",
    html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
  });

  res.status(StatusCodes.OK).json({
    message: "Link to reset your password has been sent to your email",
  });
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (confirmPassword !== password) {
    throw new ValidationError("Passwords do not match");
  }

  if (!token || Array.isArray(token))
    throw new ValidationError("Invalid token");

  const hashedToken = hashToken(token);

  const validToken = await prisma.token.findFirst({
    where: {
      token: hashedToken,
      tokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!validToken)
    throw new ValidationError("Invalid or expired password reset token");

  const hashedPassword = await bcrypt.hash(password, appConfig.SALT);

  const user = await prisma.user.update({
    where: { id: validToken.userId },
    data: { password: hashedPassword },
  });

  res.status(StatusCodes.OK).send({ message: "Password updated" });

  await prisma.token.deleteMany({
    where: {
      userId: user.id,
    },
  });

  sendEmail({
    email: user.email,
    subject: "Password changed successfully",
    html: `<h1>Your password has been changed successfully.</h1>
    <p>Hi, ${user.name}</p>
    <p>Your password has been changed successfully.</p>`,
  });

  res
    .status(StatusCodes.OK)
    .send({ message: "Password changed successfully." });
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.refreshToken;

  if (!token) throw new ValidationError("No refresh token provided");

  const hashedToken = hashToken(token);
  const stored = await prisma.token.findUnique({
    where: { token: hashedToken },
  });

  if (!stored || stored.tokenExpiry < new Date())
    throw new ValidationError("Refresh token expired or invalid");

  if (stored.revoked) {
    await prisma.token.updateMany({
      where: { userId: stored.userId },
      data: { revoked: true },
    });
    throw new ValidationError("Token reuse detected");
  }

  const newRefreshToken = generateToken();

  await prisma.$transaction([
    prisma.token.update({
      where: { token: stored.token },
      data: { revoked: true, replacedBy: hashToken(newRefreshToken) },
    }),
    prisma.token.create({
      data: {
        token: hashToken(newRefreshToken),
        userId: stored.userId,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
  });

  if (!user) throw new ValidationError("User does not exist.");

  const accessToken = signAccessToken(user.email);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    path: "/api/v1/auth/refresh",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({
    accessToken,
  });
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
    throw new UnauthorizedError("Unauthorized");
  }
};
