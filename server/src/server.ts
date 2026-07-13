import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import v1 from "./routes/v1";
import globalErrorHandler from "./middleware/error-handler";
import cookieParser from "cookie-parser";
import appConfig from "./config";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cookieParser())
    .use(
      cors({
        origin: appConfig.CLIENT_URL,
        credentials: true,
      }),
    );

  app.get("/health", (req: Request, res: Response) => {
    res.json({ ok: true, environment: appConfig.ENV });
  });

  app.use("/api/v1", v1);

  app.use(globalErrorHandler);
  return app;
};
