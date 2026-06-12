import express, { Router, Response, Request } from "express";
import tasks from "./tasks";
import projects from "./projects";
import bcrypt from "bcrypt";
import { prisma } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config";

const v1: Router = express.Router();

v1.use("/tasks", tasks);
v1.use("/projects", projects);
v1.post("/signup", async (req: Request, res: Response) => {
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
});
v1.post("/signin", async (req, res) => {
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
    );

    res.send({
      token,
    });
  }
});
v1.get("/me", async (req, res) => {
  const token = req.headers.authorization || "";
  const userDetails = jwt.verify(token, config.jwt_secret);

  const email = userDetails.email;
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

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
});

export default v1;
