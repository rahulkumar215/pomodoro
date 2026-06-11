import express, { Router, Response, Request } from "express";
import tasks from "./tasks";
import projects from "./projects";
import bcrypt from "bcrypt";
import { prisma } from "../../db";

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
v1.post("/signin", (req, res) => {});

export default v1;
