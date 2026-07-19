import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto, { BinaryToTextEncoding } from "crypto";
import { prisma } from "@/db";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ValidationError } from "@/errors";
import sendEmail from "@/utils/email";
import { StatusCodes } from "http-status-codes";
import appConfig from "@/config";
import otpGenerator from "otp-generator";

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
      <a href="${appConfig.CLIENT_URL}/set-password/${token}">${appConfig.CLIENT_URL}/set-password</a>
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
      is_verified: true,
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
      sameSite: "none",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({
      token: accessToken,
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
    <a href="${appConfig.CLIENT_URL}/reset-password/${token}">${appConfig.CLIENT_URL}/reset-password</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
  });

  res.status(StatusCodes.OK).json({
    message: "Reset password link sent to email.",
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

  const hashedPassword = await bcrypt.hash(password, Number(appConfig.SALT));

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
    path: "/api/v1/auth",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({
    accessToken,
  });
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.refreshToken;

  if (!token) throw new ValidationError("No refresh token provided");

  await prisma.token.updateMany({
    where: { token: hashToken(token) },
    data: { revoked: true },
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    path: "/api/v1/auth",
    secure: true,
  });

  res.status(StatusCodes.OK).json({
    message: "Logged out successfully.",
  });
};

export const me = (req: Request, res: Response) => {
  const user = req.user;

  if (user) {
    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        user: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified,
          isPremium: user.is_premium,
        },
      },
    });
  } else {
    throw new UnauthorizedError("Unauthorized");
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name },
    select: { name: true },
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      user,
    },
  });
};

export const updateUserEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = req.body.email;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) throw new ValidationError("This email is already in use.");

  const otp = otpGenerator.generate(6, {
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const hash = hashToken(otp);

  await prisma.otpToken.create({
    data: {
      email,
      otp: hash,
      otpExpiry: new Date(Date.now() + 5.5 * 60 * 60 * 10000 + 60000),
    },
  });

  sendEmail({
    email,
    subject: "The Code for Email Change",
    html: `<p>Hi ${req.user.name}</p>
      <p>This is the code for changing your email:</p>
      <p>${otp}</p>
      <p>The otp will expire in 10 minutes.</p>`,
  });

  res.status(StatusCodes.OK).json({
    message: "OTP has been sent to your mail.",
  });
};

export const verifyUserOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const otp = req.body.otp;

  if (!otp) throw new ValidationError("OTP not present");

  const saved = await prisma.otpToken.findUnique({
    where: { otp: hashToken(otp) },
  });

  if (!saved || saved.otpExpiry < new Date())
    throw new ValidationError("OTP not present or expired");

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { email: saved.email },
    select: { email: true },
  });

  const accessToken = signAccessToken(user.email);

  res.status(StatusCodes.OK).json({
    status: "success",
    token: accessToken,
    data: {
      user,
    },
  });

  await prisma.otpToken.deleteMany({
    where: { email: user.email },
  });
};
