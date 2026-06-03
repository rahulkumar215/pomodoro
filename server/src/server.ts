import express from "express";
import cors from "cors";
import morgan from "morgan";
import { prisma } from "./lib/prisma";

const app = express();

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

app.get("/users", async (req, res) => {
  const users = await prisma.users.findMany();
  res.json(users);
});

export default app;
